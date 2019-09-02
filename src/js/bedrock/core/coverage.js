const fs = require('fs');
const path = require('path');

const coverageDataDir = 'scratch';

const writeCoverageData = function (data) {
  if (Object.keys(data).length > 0) {
    const coverageDataFilePath = path.join(coverageDataDir, 'coverage.json');

    console.log('Writing coverage data to: ' + coverageDataFilePath);

    if (!fs.existsSync(coverageDataDir)) {
      fs.mkdirSync(coverageDataDir);
    }

    fs.writeFileSync(coverageDataFilePath, JSON.stringify(data));
  }
};

module.exports = {
  writeCoverageData: writeCoverageData
};
