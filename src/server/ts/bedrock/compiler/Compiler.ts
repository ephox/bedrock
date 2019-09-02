import * as path from 'path';
import * as fs from 'fs';
import * as Webpack from '../compiler/Webpack';

export const compile = function (tsConfigFile, scratchDir, basedir, exitOnCompileError, files, coverage) {
  const getCompileFunc = function () {
    return Webpack.compile;
  };

  const isTs = function (filePath) {
    const ext = path.extname(filePath);
    return ext === '.ts' || ext === '.tsx';
  };

  const tsFiles = files.filter(isTs);

  const generate = function () {
    return new Promise((resolve) => {
      const compile = getCompileFunc();
      if (tsFiles.length > 0) {
        compile(
          tsConfigFile,
          scratchDir,
          basedir,
          exitOnCompileError,
          tsFiles,
          coverage,
          function (compiledJsFilePath) {
            resolve(fs.readFileSync(compiledJsFilePath));
          }
        );
      } else {
        resolve('');
      }
    });
  };

  return {
    jsFiles: files.filter(function (filePath) {
      return !isTs(filePath);
    }),
    generate: generate
  };
};
