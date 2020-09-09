open BsMocha.Mocha;

// BuckleScript doesn't have a binding for this, in an attempt to discourage it
[@bs.new] external makeExn: string => Js.Exn.t = "Error";

// PprintAssertionError is a pain to verify with NodeJS `assert.throws()`
[@bs.module "assert"]
external validateThrows:
  (~block: 'a => 'b, ~error: Js.t('c), ~message: string) => unit =
  "throws";

let verifyBedrockExn = (~message: string, ~expected: string, ~actual: string) => {
  "name": "PprintAssertionError",
  "message": message,
  "diff": {
    "expected": expected,
    "actual": actual,
  },
};

describe("ReasonML assertion bindings", () => {
  it("Simple assert", () => {
    Assert.eq(1, 1, ~message="should pass")
  });
  it("Assert with message", () => {
    validateThrows(
      ~block=() => {Assert.eq(1, 2, ~message="should fail")},
      ~error=
        verifyBedrockExn(~message="should fail", ~expected="1", ~actual="2"),
      ~message="did not fail correctly"
    )
  });

  it("Succeeds", () => {
    Assert.succeeds(() => (), ~message="empty function")
  });
  it("Fail", () => {
    BsMocha.Assert.throws(
      () => {Assert.fail("hi")},
      makeExn("Test failed\nhi"),
    )
  });
});

// Since these methods can't be used without the custom makeExn, these aren't useful,
describe("ReasonML throw bindings", () => {
  it("Throws", () => {
    Assert.throws(
      [%raw "() => { throw 'hi'; }"],
      "hi",
      ~message="did not throw",
    )
  });
  it("Throws Error", () => {
    Assert.throwsError(
      () => Js.Exn.raiseError("hi"),
      "hi",
      ~message="did not throw",
    )
  });
});
