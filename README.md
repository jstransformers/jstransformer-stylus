# jstransformer-stylus

[Stylus](https://learnboost.github.io/stylus/) support for [JSTransformers](http://github.com/jstransformers/jstransformer-stylus).

[![Build Status](https://img.shields.io/travis/jstransformers/jstransformer-stylus/master.svg)](https://travis-ci.org/jstransformers/jstransformer-stylus)
[![Coverage Status](https://img.shields.io/coveralls/jstransformers/jstransformer-stylus/master.svg)](https://coveralls.io/r/jstransformers/jstransformer-stylus?branch=master)
[![Dependency Status](https://img.shields.io/gemnasium/jstransformers/jstransformer-stylus.svg)](https://gemnasium.com/jstransformers/jstransformer-stylus)
[![NPM version](https://img.shields.io/npm/v/jstransformer-stylus.svg)](https://www.npmjs.org/package/jstransformer-stylus)

## Installation

    npm install jstransformer-stylus

## API

```js
var foo = require('jstransformer')(require('jstransformer-foo'))

var css = "fonts = helvetica, arial, sans-serif\
body {\
  padding: 50px;\
  font: 14px/1.4 fonts;\
}";
foo.render(css).body
```

## License

MIT