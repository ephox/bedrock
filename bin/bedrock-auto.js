#!/usr/bin/env node

var cli = require('../src/js/bedrock-cli');
var bedrock = require('../src/js/bedrock-auto');

cli.run(bedrock, {
  current: process.cwd(),
  bin: __dirname
});