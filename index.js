'use strict';

var path = require('path');
var fs = require('fs');
var stylus = require('stylus');
var clone = require('clone');
var Promise = require('promise');

exports.name = 'stylus';
exports.inputFormats = ['styl', 'stylus'];
exports.outputFormat = 'css';

/**
 * Retrieves a Stylus renderer from the given options.
 */
function getRenderer(str, options, locals) {
  var renderer = stylus(str);

  // Special handling for stylus js api functions
  // given { define: { foo: 'bar', baz: 'quux' } }
  // runs renderer.define('foo', 'bar').define('baz', 'quux')

  var allowed = ['set', 'define'];
  var special = {}
  var allowedSingle = ['include', 'import', 'use'];
  var specialSingle = {}
  var normal = clone(options);
  for (var v in options) {
    if (allowed.indexOf(v) > -1) {
      special[v] = options[v];
      delete normal[v];
    }
    else if (allowedSingle.indexOf(v) > -1) {
        specialSingle[v] = options[v];
      delete normal[v];
    }
  }

  // special options through their function names
  for (var k in special) {

    /* Enables support of "in-view-engine" usage of "use=" option:
    * E.g. using pug: 
    * block styles
    *   style
    *     include:stylus(use='autoprefixer-stylus',compress=true) stylesheets/_common.styl
    */
    if (k == "use" && typeof (special[k]) == "string") {
      // Probably, it is a require
      var req = require(special[k]);
      renderer[k](req, {});

      continue;
    }
    
    for (var v in special[k]) {
      renderer[k](v, special[k][v]);
    }
  }
  
  // special options with single parameter through their function names
  for (var k in specialSingle) {
    renderer[k](specialSingle[k]);
  }

  // normal options through set()
  for (var k in normal) {
    renderer.set(k, normal[k]);
  }

  // Register locals as defines.
  for (var key in locals || {}) {
    renderer.define(key, locals[key]);
  }
  return renderer;
}

exports.render = function (str, options, locals) {
  var result;
  getRenderer(str, options, locals).render(function (err, res) {
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

exports.renderAsync = function (str, options, locals) {
  return new Promise(function (fulfill, reject) {
    getRenderer(str, options, locals).render(function (err, res) {
      if (err) {
        reject(err);
      }
      else {
        fulfill(res)
      }
    });
  });
};

exports.renderFileAsync = function (filename, options, locals) {
  options = options || {};
  options.filename = path.resolve(filename);
  return new Promise(function (fulfill, reject) {
    fs.readFile(filename, 'utf-8', function (err, str) {
      if (err) {
        reject(err);
      }
      else {
        fulfill(exports.renderAsync(str, options, locals));
      }
    })
  })
};
