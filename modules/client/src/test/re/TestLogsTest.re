open! BsMocha;
open Mocha;

describe("ReasonML test logs bindings", () => {
  it("Can just call the functions", () => {
    [%debugger];
    let empty = TestLogs.emptyLogs();
    Assert.equal(0, empty.history->Array.length);

    // This just makes sure BuckleScript is doing the right thing with the variant
    Assert.equal(TestLogs.Original, [%raw "0"]);
    Assert.equal(TestLogs.Started, [%raw "1"]);
    Assert.equal(TestLogs.Finished, [%raw "2"]);
  })
});
