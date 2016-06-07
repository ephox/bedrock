var fs = require('fs');
var readdirSyncRec = require('recursive-readdir-sync');
var attempt = require('./attempt.js');

var validateFile = function (name, value) {
  try {
    fs.accessSync(value);
    if (!fs.statSync(value).isFile()) throw new Error('Property: ' + name + ' => Value: ' + value + ' was not a file');
    return attempt.passed(value);
  } catch (err) {
    return attempt.failed({
      property: name,
      value: value,
      error: err,
      label: 'Property: ' + name + ' => Value: ' + value + ' was not a file or ' + err
    });
  }
};

var isOneOf = function (values) {
  return function (name, value) {
    if (values.indexOf(value) === -1) {
      return attempt.failed({
        property: name,
        value: value,
        error: 'custom',
        label: 'Invalid value for property: ' + name +
          '. Actual value: ' + value + '\nRequired values: one of ' + JSON.stringify(values)
      });
    } else {
      return attempt.passed(value);
    }
  };
};

var isAny = function (name, value) {
  return attempt.passed(value);
};

var listDirectory = function (pattern) {
  return function (name, value) {
    return readdirSyncRec(value).filter(function (f) {
      return f.indexOf(pattern) >-1 && fs.lstatSync(f).isFile();
    });
  };
};

module.exports = {
  validateFile: validateFile,
  isAny: isAny,
  isOneOf: isOneOf,
  listDirectory: listDirectory
};
