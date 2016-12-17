'use strict'

var path = require('path')
var fs = require('fs')
var stylus = require('stylus')
var clone = require('clone')
var Promise = require('promise')

exports.name = 'stylus'
exports.inputFormats = ['styl', 'stylus']
exports.outputFormat = 'css'

/**
 * Retrieves a Stylus renderer from the given options.
 */
function getRenderer(str, options, locals) {
  var renderer = stylus(str)

  // Special handling for stylus js api functions
  // given { define: { foo: 'bar', baz: 'quux' } }
  // runs renderer.define('foo', 'bar').define('baz', 'quux')

  var allowed = ['set', 'define']
  var special = {}
  var allowedSingle = ['include', 'import', 'use']
  var specialSingle = {}
  var normal = clone(options)

  for (var option in options) {
    // if the option is a special option
    if (allowed.indexOf(options) > -1) {
      // add it to the special object
      special[option] = options[option]
      // remove it from the options passed to stylus
      delete normal[option]
    } else if (allowedSingle.indexOf(option) > -1) {
      // if the option is a specialSingle option
      // add it to the specialSingle object
      specialSingle[option] = options[option]
      // remove it from the options passed to stylus
      delete normal[option]
    }
  }

  // special options through their function names
  // each method (i.e. `set` or `define`)
  for (let method in special) {
    if ({}.hasOwnProperty.call(special, method)) {
      // each variable in the method
      for (let variable in special[method]) {
        if ({}.hasOwnProperty.call(special[method], variable)) {
          // set it using stylus
          // i.e. stylus.set(variable, value)
          renderer[method](variable, special[method][variable])
        }
      }
    }
  }

  // special options with single parameter through their function names
  // each method (i.e. `use`, `import`, or `include`)
  for (let method in specialSingle) {
    if ({}.hasOwnProperty.call(specialSingle, method)) {
      var imports = []
      // if it is an array (typeof array is object)
      if (typeof specialSingle[method] === 'object') {
        imports = specialSingle[method]
      } else {
        // make it an array
        imports = [specialSingle[method]]
      }
      for (var i in imports) {
        if ({}.hasOwnProperty.call(imports, i)) {
          var fn = imports[i]
          // if it's a string, require it
          if (typeof fn === 'string') {
            // eslint-disable-next-line import/no-dynamic-require
            fn = require(fn)()
          }
          // otherwise use it as-is

          // like stylus.include(fn)
          renderer[method](fn)
        }
      }
    }
  }

  // normal options through set()
  for (let key in normal) {
    if ({}.hasOwnProperty.call(normal, key)) {
      renderer.set(key, normal[key])
    }
  }

  // Register locals as defines.
  for (let key in (locals || {})) {
    if ({}.hasOwnProperty.call((locals || {}), key)) {
      renderer.define(key, locals[key])
    }
  }
  return renderer
}

exports.render = function (str, options, locals) {
  var result
  getRenderer(str, options, locals).render(function (err, res) {
    if (err) {
      throw err
    }
    // todo: how do we know what the dependencies are?
    result = res
  })
  if (!result) {
    throw new Error('stylus compilation could not complete synchronously.')
  }
  return result
}

exports.renderFile = function (filename, options, locals) {
  options = options || {}
  options.filename = path.resolve(filename)
  var str = fs.readFileSync(filename, 'utf8')
  return exports.render(str, options, locals)
}

exports.renderAsync = function (str, options, locals) {
  return new Promise(function (resolve, reject) {
    getRenderer(str, options, locals).render(function (err, res) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

exports.renderFileAsync = function (filename, options, locals) {
  options = options || {}
  options.filename = path.resolve(filename)
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, 'utf-8', function (err, str) {
      if (err) {
        reject(err)
      } else {
        resolve(exports.renderAsync(str, options, locals))
      }
    })
  })
}
