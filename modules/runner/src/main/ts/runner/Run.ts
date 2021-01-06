import { Context, ExecuteFn, Failure, Runnable, RunnableState, TestThrowable } from '@ephox/bedrock-common';
import Promise from '@ephox/wrap-promise-polyfill';
import { isInternalError, MultipleDone, SkipError } from '../core/Errors';
import { ErrorCatcher } from './ErrorCatcher';

const isPromiseLike = (value: unknown | undefined): value is PromiseLike<any> =>
  value !== undefined && (value as PromiseLike<any>).then !== undefined;

const errorCatcher = ErrorCatcher();

export const runWithErrorCatcher = <T>(runnable: Runnable, fn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    let errorOccurred = false;
    const catcher = errorCatcher.bind((e) => {
      if (!errorOccurred) {
        errorOccurred = true;
        const err = isInternalError(e) ? e : Failure.prepFailure(e);
        runnable.setResult(RunnableState.Failed, err);
        reject(err);
      }
    });

    fn().then((result) => {
      catcher.unbind();
      if (!errorOccurred) {
        resolve(result);
      }
    }, (e) => {
      catcher.unbind();
      if (!errorOccurred) {
        reject(e);
      }
    });
  });
};

const runExecFn = (fn: ExecuteFn, context: Context): Promise<void> => {
  return new Promise((resolve, reject) => {
    let doneCalled = false;
    const done = (err?: TestThrowable) => {
      if (doneCalled) {
        throw new MultipleDone('done() called multiple times', err);
      } else if (err !== undefined) {
        reject(Failure.prepFailure(err));
      } else {
        resolve();
      }
      doneCalled = true;
    };

    try {
      // If the function has 1 or more arguments, it's using the async callback
      const retValue: any = fn.call(context, done);
      if (fn.length === 0) {
        if (isPromiseLike(retValue)) {
          retValue.then(() => done(), done);
        } else {
          resolve();
        }
      }
    } catch (e) {
      const err = isInternalError(e) ? e : Failure.prepFailure(e);
      reject(err);
    }
  });
};

export const run = (runnable: Runnable, context: Context): Promise<void> => {
  // Ensure we don't run if we already have a result or don't have anything to run
  if (runnable.isFailed()) {
    return Promise.reject(runnable.error);
  } else if (runnable.isSkipped()) {
    return Promise.reject(new SkipError());
  } else if (runnable.fn === undefined) {
    return Promise.resolve();
  } else {
    return runExecFn(runnable.fn, context).catch((e) => {
      // Update the runnable state when an error occurs
      if (e instanceof SkipError) {
        runnable.setResult(RunnableState.Skipped);
      } else {
        runnable.setResult(RunnableState.Failed, e);
      }
      return Promise.reject(e);
    });
  }
};

export const runWithTimeout = (runnable: Runnable, context: Context, defaultTimeout: number): Promise<void> => {
  // Run the execute function with a timeout if required
  const timeout = runnable.timeout() === -1 ? defaultTimeout : runnable.timeout();
  if (timeout <= 0) {
    return run(runnable, context);
  } else {
    return new Promise((resolve, reject) => {
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        reject(Failure.prepFailure(new Error(`Test ran too long - timeout of ${timeout}ms exceeded`)));
      }, timeout);

      run(runnable, context).then(() => {
        clearTimeout(timer);
        if (!timedOut) {
          resolve();
        }
      }, (e) => {
        clearTimeout(timer);
        reject(e);
      });
    });
  }
};