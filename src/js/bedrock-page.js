var go = function (settings) {
  console.log('settings', settings);
  var serve = require('./bedrock/server/pageserve');
  var attempt = require('./bedrock/core/attempt');

  var serveSettings = {
    projectdir: settings.projectdir,
    basedir: settings.basedir,
    config: settings.config,
    testfiles: settings.testfiles,
    // There is no driver for manual mode.
    driver: attempt.failed('There is no webdriver for manual mode'),
    master: null,
    page: settings.page
  };

  serve.start(serveSettings, function (service/* , done */) {
    console.log('bedrock (manual) available at: http://localhost:' + service.port);
  });
};

module.exports = {
  go: go,
  mode: 'forPage'
};

