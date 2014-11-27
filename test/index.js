'use strict';

var assert = require('assert');
var fs = require('fs');

var transform = require('../');

var input = fs.readFileSync(__dirname + '/input.styl', 'utf8');
var expected = fs.readFileSync(__dirname + '/expected.css', 'utf8');

var output = transform.render(input);
fs.writeFileSync(__dirname + '/output.css', output);
assert(output === expected, 'output.css should equal expected.css');

console.log('test passed');
