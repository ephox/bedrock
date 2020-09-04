open BsMocha;
open Mocha;

describe("ReasonML unit test bindings", () => {
  it("Can just call the functions", () => {
    let empty = () => ();
    // we can't validate the functions do anything, but we can call them and make sure the bindings work
    let _ = UnitTest.test("sync", empty);
    let _ = UnitTest.asyncTest("async", (_success, _failure) => ());
    ();
  })
});
