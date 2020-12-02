import * as LoggedError from './LoggedError';
import * as TestError from './TestError';
import { TestLabel } from './TestLabel';
import * as TestLogs from './TestLogs';

type TestLogs = TestLogs.TestLogs;
type TestLogEntry = TestLogs.TestLogEntry;
type TestError = TestError.TestError;
type LoggedError = LoggedError.LoggedError;

export type TestThrowable = TestLabel | TestError;

const cleanStack = (error: Error, linesToRemove = 1) => {
  if (error.stack === undefined) {
    return '';
  }

  const lines = error.stack.split('\n');
  const message = lines[0];
  const stack = lines.slice(1 + linesToRemove);
  return message + '\n' + stack.join('\n');
};

export const normalizeError = (err: TestThrowable): TestError => {
  if (typeof err === 'string') {
    // Create an error object, but strip the stack of the 2 latest calls as it'll
    // just be this function and the previous function that called this (ie asyncTest)
    const error = new Error(err);
    error.stack = cleanStack(error, 2);
    return error;
  } else if (typeof err === 'function') {
    return normalizeError(err());
  } else {
    return err;
  }
};

const processLog = (logs: TestLogs): string[] => {
  const outputToStr = function (numIndent: number, entries: TestLogEntry[]) {
    let everything: string[] = [];
    let indentString = '';
    for (let i = 0; i < numIndent; i++) {
      indentString += ' ';
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const output = (() => {
        const traceLines = entry.trace === null || typeof entry.trace !== 'string' ? [] : [ '', '' ].concat(entry.trace.split('\n'));

        if (entry.entries.length === 0) {
          if (entry.trace === null) {
            return [ indentString + '*  ' + entry.message ];
          } else {
            return [ indentString + '*  ' + entry.message ].concat(traceLines);
          }
        } else {
          // We have entries ... let's format them.
          return [ indentString + '*  ' + entry.message ].concat(
            outputToStr(numIndent + 2, entry.entries)
          ).concat(traceLines);
        }
      })();
      everything = everything.concat(output);
    }
    return everything;
  };

  return outputToStr(2, logs.history);
};

export const prepFailure = (err: TestThrowable | LoggedError, logs: TestLogs = TestLogs.init()): LoggedError => {
  if (LoggedError.isLoggedError(err)) {
    return err;
  } else {
    const normalizedErr = normalizeError(err);
    const failureMessage = processLog(logs);
    return LoggedError.loggedError(normalizedErr, failureMessage);
  }
};