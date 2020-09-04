open BsMocha.Mocha;

// BuckleScript doesn't have a binding for this, in an attempt to discourage it
[@bs.new] external makeExn: string => Js.Exn.t = "Error";

describe("ReasonML assertion bindings", () => {
  it("Simple assert", () => {
    Assert.eq(1, 1)
  });
  it("Assert with message", () => {
    BsMocha.Assert.throws(
      () => {Assert.eq(~message="hi", 1, 2)},
      makeExn("hi"),
    )
  });

  it("Succeeds", () => {
    Assert.succeeds(() => ())
  });
  it("Fail", () => {
    BsMocha.Assert.throws(() => {Assert.fail("hi")}, makeExn("hi"))
  });
});

// Since these methods can't be used without the custom makeExn, these aren't useful,
describe("ReasonML throw bindings", () => {
  it("Throws", () => {
    Assert.throws([%raw "() => { throw 'hi'; }"], "hi")
  });
  it("Throws Error", () => {
    Assert.throwsError(() => Js.Exn.raiseError("hi"), "hi")
  });
});
