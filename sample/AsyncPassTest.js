asynctest(
  'AsyncPassTest',

  [

  ],

  function () {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    setTimeout(function () {
      success();
    }, 2000);
  }
);