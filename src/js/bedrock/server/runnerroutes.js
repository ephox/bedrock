if (!Array.prototype.flatMap) {
  // simple polyfill for node versions < 11
  // not at all to ES2019 spec, but if you're relying on that you should use node 11 /shrug
  const concat = (x, y) => x.concat(y);

  const flatMap = (f, xs) => xs.map(f).reduce(concat, [])

  Array.prototype.flatMap = function (f) {
    return flatMap(f, this);
  };
}

var generate = function (mode, projectdir, basedir, configFile, bundler, testfiles, chunk, retries, singleTimeout, stopOnFailure, basePage, coverage) {
  var path = require('path');
  var routes = require('./routes');
  var compiler = require('../compiler/compiler');
  var fs = require('fs');
  var glob = require('glob');

  var files = testfiles.map(function (filePath) {
    return path.relative(projectdir, filePath);
  });

  var testGenerator = compiler(
    path.join(projectdir, configFile),
    path.join(projectdir, 'scratch'),
    mode === 'auto',
    files,
    coverage
  );


  // read the project json file to determine the project name to expose resources as `/project/${name}`
  const pkjson = JSON.parse(fs.readFileSync(`${projectdir}/package.json`));

  // Search for yarn workspace projects to use as resource folders
  const workspaceRoots = !pkjson.workspaces ? [] : pkjson.workspaces.flatMap(w => glob.sync(w)).flatMap((moduleFolder) => {
    const moduleJson = `${moduleFolder}/package.json`;
    if (fs.statSync(moduleJson)) {
      const workspaceJson = JSON.parse(fs.readFileSync(moduleJson));
      return [{ name: workspaceJson.name, folder: moduleFolder }];
    } else {
      return [];
    }
  });

  const resourceRoots = [{ name: pkjson.name, folder: '.' }].concat(workspaceRoots);

  // console.log(`Resource maps from ${projectdir}: \n`, resourceRoots.map(({ name, folder }) => `/project/${name}/ => ${folder}`));

  const resourceRoutes = resourceRoots.map(({ name, folder }) => routes.routing('GET', `/project/${name}`, path.join(projectdir, folder)));

  const precompiledTests = (mode === 'auto' ? testGenerator.generate() : Promise.resolve(null));

  return precompiledTests.then(
    (precompTests) => {
      var routers = resourceRoutes.concat([
        // fallback resource route to project root
        routes.routing('GET', '/project', projectdir),

        // bedrock resources
        routes.routing('GET', '/js', path.join(basedir, 'src/resources')),
        routes.routing('GET', '/lib/jquery', path.dirname(require.resolve('jquery'))),
        routes.routing('GET', '/lib/babel-polyfill', path.join(path.dirname(require.resolve('babel-polyfill')), '../dist')),
        routes.routing('GET', '/css', path.join(basedir, 'src/css')),

        // test code
        routes.asyncJs('GET', '/compiled/tests.js', function (done) {
          if (precompTests !== null) {
            done(precompTests);
          } else {
            testGenerator.generate().then(done);
          }
        }),
        routes.routing('GET', '/compiled', path.join(projectdir, 'scratch/compiled')),

        // harness API
        routes.json('GET', '/harness', {
          stopOnFailure: stopOnFailure,
          chunk: chunk,
          retries: retries,
          timeout: singleTimeout
        })
      ]);

      var fallback = routes.constant('GET', basedir, basePage);

      return {
        routers: routers,
        fallback: fallback
      };
    }
  );
};

module.exports = {
  generate: generate
};