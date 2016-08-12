var go = function (settings) {
  var serve = require('./bedrock/server/serve');
  var attempt = require('./bedrock/core/attempt');

  var boltroutes = require('./bedrock/server/boltroutes');

  var poll = require('./bedrock/poll/poll');
  var reporter = require('./bedrock/core/reporter');

  var master = require('./bedrock/server/drivermaster').create();

  var driver = require('./bedrock/auto/driver').create({
    browser: settings.browser
  });

  var lifecycle = require('./bedrock/core/lifecycle');
  var runner = boltroutes.generate(settings.projectdir, settings.basedir, settings.config, settings.testfiles, settings.stopOnFailure);

  var serveSettings = {
    projectdir: settings.projectdir,
    basedir: settings.basedir,
    testfiles: settings.testfiles,
    driver: attempt.passed(driver),
    master: master,
    runner: runner,
    loglevel: settings.loglevel
  };

  var isPhantom = settings.browser === 'phantomjs';

  serve.start(serveSettings, function (service, done) {
    if (! isPhantom) console.log('bedrock-auto available at: http://localhost:' + service.port);
    var result = driver.get('http://localhost:' + service.port).then(function () {
      var message = isPhantom ? '\nPhantom tests loading ...\n' : '\n ... Initial page has loaded ...';
      console.log(message);
      service.markLoaded();
      return poll.loop(master, driver, settings).then(function (data) {
        return reporter.write({
          name: settings.name,
          output: settings.output
        })(data);
      });
    });
    lifecycle.shutdown(result, driver, done);
  });
};

module.exports = {
  go: go,
  mode: 'forAuto'
};