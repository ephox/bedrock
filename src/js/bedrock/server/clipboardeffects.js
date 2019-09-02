const childProcess = require('child_process');
const execSync = childProcess.execSync;
const path = require('path');

const exitcodes = require('../util/exitcodes');

/*
 JSON API for data: {
   import: "<file name>"
 }
 */
const importClipboard = function (basedir, clipboarddir, data) {
  const fileName = data.import;
  const fullPath = path.join(clipboarddir, fileName);
  const args = [
    path.join(basedir, 'bin/wink.exe'),
    '-i ' + fullPath
  ];

  const result = execSync(args.join(' '));
  if (result.length > 0) {
    console.error(result);
    process.exit(exitcodes.failures.wink);
  }

  return Promise.resolve({});
};

const route = function (basedir, clipboarddir) {
  return function (data) {
    return importClipboard(basedir, clipboarddir, data);
  };
};

module.exports = {
  route: route
};
