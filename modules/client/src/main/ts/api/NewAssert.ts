import { TestError, TestLabel } from '@ephox/bedrock-common';
import { Pprint, Testable } from '@ephox/dispute';

const eq = function <T> (message: TestLabel, expected: T, actual: T, tt: Testable.Testable<T> = Testable.tAny): void {
  const result = tt.eq(expected, actual);
  if (!result) {
    const sMessage = TestLabel.asString(message);
    const ppExpected = Pprint.render(expected, tt);
    const ppActual = Pprint.render(actual, tt);
    throw TestError.pprintAssertionError(sMessage, ppExpected, ppActual);
  }
};

const throws = function (message: TestLabel, f: () => void, expected?: string): void {
  const token = {};

  try {
    f();
    // noinspection ExceptionCaughtLocallyJS
    throw token;
  } catch (e) {
    if (e === token) {
      throw new Error('Expected function to throw, but it didn\'t.\n' + TestLabel.asString(message));
    }
    if (expected !== undefined) {
      eq(message, expected, e);
    }
  }
};

const throwsError = function (message: TestLabel, f: () => void, expected?: string): void {
  const token = {};

  try {
    f();
    // noinspection ExceptionCaughtLocallyJS
    throw token;
  } catch (e) {
    if (e === token) {
      throw new Error('Expected function to throw, but it didn\'t.\n' + TestLabel.asString(message));
    }
    if (expected !== undefined) {
      eq(message, expected, e.message);
    }
  }
};

const succeeds = function (message: TestLabel, f: () => void): void {
  try {
    f();
  } catch (e) {
    throw new Error('Expected function to not throw, but it did.\n' + TestLabel.asString(message));
  }
};

const fail = function (message: TestLabel): void {
  throw new Error('Test failed\n' + TestLabel.asString(message));
};

export {
  eq,
  throws,
  throwsError,
  succeeds,
  fail
};
