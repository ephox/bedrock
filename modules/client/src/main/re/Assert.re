[@bs.module "../ts/api/LegacyAssert"]
external eq: ('a, 'a, ~message: string=?) => unit = "eq";
let eq = (~message=?, expected, actual) => eq(expected, actual, ~message?);

[@bs.module "../ts/api/LegacyAssert"]
external throws: (unit => unit, 'a, ~message: string=?) => unit = "throws";
/**
 * This binding isn't very useful in ReasonML code, because BuckleScript has no `throws` binding.
 * 
 * It might be handy for testing JS functions that throw, however.
 */
let throws = (~message=?, f, actual) => throws(f, actual, ~message?);

[@bs.module "../ts/api/LegacyAssert"]
external throwsError: (unit => unit, string, ~message: string=?) => unit =
  "throwsError";
/**
 * This binding isn't very useful in ReasonML code, because BuckleScript has no `new Error()` binding.
 * 
 * It might be handy for testing JS functions that throw, however.
 */
let throwsError = (~message=?, f, actual) =>
  throwsError(f, actual, ~message?);

[@bs.module "../ts/api/LegacyAssert"]
external succeeds: (unit => unit, ~message: string=?) => unit = "succeeds";
let succeeds = (~message=?, f) => succeeds(f, ~message?);

[@bs.module "../ts/api/LegacyAssert"] external fail: string => unit = "fail";
