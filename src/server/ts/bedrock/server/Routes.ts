import * as server from 'serve-static';
import * as Matchers from './Matchers';

export const routing = function (method, prefix, source) {
  const router = server(source);

  const go = function (request, response, done) {
    request.url = request.url.substring(prefix.length);
    router(request, response, done);
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(prefix)],
    go: go
  };
};

const concludeJson = function (response, status, info) {
  response.writeHeader(status, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(info));
};

export const json = function (method, prefix, data) {
  const go = function (request, response/* , done */) {
    concludeJson(response, 200, data);
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(prefix)],
    go: go
  };
};

export const asyncJs = function (method, url, fn) {
  const go = function (request, response/* , done */) {
    fn(function (data) {
      response.writeHeader(200, {'Content-Type': 'text/javascript'});
      response.end(data);
    });
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.urlMatch(url)],
    go: go
  };
};

export const effect = function (method, prefix, action) {
  const go = function (request, response/* , done */) {
    let body = '';
    request.on('data', function (data) {
      body += data;
    });

    request.on('end', function () {
      const parsed = JSON.parse(body);
      action(parsed).then(function () {
        concludeJson(response, 200, {});
      }, function (err) {
        console.error('Executing effect failed: \n** ' + body);
        console.error('Error: ', err);
        concludeJson(response, 500, {});
      });
    });
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(prefix)],
    go: go
  };
};

export const rewrite = function (method, root, input, output) {
  const base = server(root);

  const go = function (request, response, done) {
    request.url = output;
    base(request, response, done);
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(input)],
    go: go
  };
};

export const constant = function (method, root, url) {
  const base = server(root);

  const go = function (request, response, done) {
    request.url = url;
    base(request, response, done);
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(root)],
    go: go
  };
};

export const host = function (method, root) {
  const base = server(root);

  const go = function (request, response, done) {
    base(request, response, done);
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(root)],
    go: go
  };
};

export const hostOn = function (method, prefix, root) {
  const base = server(root);

  const go = function (request, response, done) {
    const original = request.url;
    request.url = original.substring((prefix + '/').length);
    base(request, response, done);
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(prefix)],
    go: go
  };
};

export const unsupported = function (method, root, label) {
  const go = function (request, response/* , done */) {
    concludeJson(response, 404, {error: label});
  };

  return {
    matches: [Matchers.methodMatch(method), Matchers.prefixMatch(root)],
    go: go
  };
};

export const route = function (routes, fallback, request, response, done) {
  request.originalUrl = request.url;

  const match = routes.find(function (candidate) {
    return candidate.matches.every(function (match) {
      return match(request);
    });
  });

  const matching = match === undefined ? fallback : match;
  matching.go(request, response, done);
};
