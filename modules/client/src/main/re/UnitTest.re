[@bs.module "../ts/api/UnitTest"]
external test: (string, unit => unit) => unit = "test";

[@bs.module "../ts/api/UnitTest"]
external asyncTest:
  (string, (unit => unit, (string, TestLogs.logs) => unit) => unit) => unit =
  "asyncTest";
