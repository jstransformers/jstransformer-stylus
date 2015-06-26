'use strict';

var path = require('path');
var fs = require('fs');
var stylus = require('stylus');
var clone = require('clone');

exports.name = 'stylus';
exports.inputFormats = ['styl', 'stylus'];
exports.outputFormat = 'css';

exports.render = function (str, options, locals) {
  var renderer = stylus(str);

  // Special handling for stylus js api functions
  // given { define: { foo: 'bar', baz: 'quux' } }
  // runs renderer.define('foo', 'bar').define('baz', 'quux')

  var allowed = ['set', 'include', 'import', 'define', 'use'];
  var special = {}
  var normal = clone(options);
  for (var v in options) {
    if (allowed.indexOf(v) > -1) {
      special[v] = options[v];
      delete normal[v];
    }
  }

  // special options through their function names
  for (var k in special) {
    for (var v in special[k]) {
      renderer[k](v, special[k][v]);
    }
  }

  // normal options through set()
  for (var k in normal) {
    renderer.set(k, normal[k]);
  }

  // Register locals as defines.
  for (var key in locals || {}) {
    renderer.define(key, locals[key]);
  }

  var result;
  renderer.render(function (err, res) {
    if (err) throw err;
    // todo: how do we know what the dependencies are?
    result = res;
  });
  if (!result) {
    throw new Error('stylus compilation could not complete synchronously.');
  }
  return result;
};
exports.renderFile = function (filename, options, locals) {
  options = options || {};
  options.filename = path.resolve(filename);
  var str = fs.readFileSync(filename, 'utf8');
  return exports.render(str, options, locals);
};
