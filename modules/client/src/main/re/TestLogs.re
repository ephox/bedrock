type logEntryState = | Original | Started | Finished;

/** This is type any, so it's opaque */
type trace;

type testLogEntry = pri {
  message: string,
  entries: array(testLogEntry),
  state: logEntryState,
  trace: trace
};
type logs = pri {
  history: array(testLogEntry)
};

[@bs.scope "TestLogs"] [@bs.module "../ts/api/TestLogs"]
external emptyLogs: unit => logs = "emptyLogs";
