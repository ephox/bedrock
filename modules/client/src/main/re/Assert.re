[@bs.module "../ts/api/NewAssert"]
external eq: (~message: string, 'a, 'a) => unit = "eq";

/**
 * This binding isn't very useful in ReasonML code, because BuckleScript has no `throws` binding.
 *
 * It might be handy for testing JS functions that throw, however.
 */
[@bs.module "../ts/api/NewAssert"]
external throws: (~message: string, unit => unit, 'a) => unit = "throws";

/**
 * This binding isn't very useful in ReasonML code, because BuckleScript has no `new Error()` binding.
 *
 * It might be handy for testing JS functions that throw, however.
 */
[@bs.module "../ts/api/NewAssert"]
external throwsError: (~message: string, unit => unit, string) => unit =
  "throwsError";

[@bs.module "../ts/api/NewAssert"]
external succeeds: (~message: string, unit => unit) => unit = "succeeds";

[@bs.module "../ts/api/NewAssert"] external fail: string => unit = "fail";
