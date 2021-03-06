# Deferred.js  [![Current Build Status](https://travis-ci.org/kevinconway/Deferred.js.png?branch=master)](https://travis-ci.org/kevinconway/Deferred.js) [![Promises/A+ Logo](http://promises-aplus.github.com/promises-spec/assets/logo-small.png)](http://promises-aplus.github.com/promises-spec)

*Cross platform, A+ 1.1.1 compliant promises.*

## What

A deferred is an object that represents a future value. Its purpose is to help
simplify async programming patterns.

This package contains an implementation of the [Promises/A+ specification][].

For the purposes of this library, a deferred is an A+ compliant thenable
that represents a future value. A promise is an interface to a deferred that
prevents accidental resolution or rejection.

## Examples

```javascript

    ajax('api.somesite.com').then(saveToDb).then(printToUser, handleError)

```

For more detailed usage guides and API specifications, see the docs directory.

## Setup

### Node.js

This package is published through NPM under the name 'deferredjs':

    $ npm install deferredjs

Once installed, simply ```Deferred = require("deferredjs").Deferred```.

### Browser

This module uses browserify to create a browser compatible module. The default
grunt workflow for this project will generate both a full and minified browser
script in a build directory which can be included as a ```<script>``` tag:

    <script src="deferred.browser.min.js"></script>

The package is exposed via the global name 'deferredjs'.

### Tests

Running the `npm test` command will kick off the default grunt workflow. This
will lint using jslint, run the mocha/expect tests, generate a browser module,
and run the community specification tests.

## License

This project is released and distributed under an MIT License.

    Copyright (C) 2013 Kevin Conway

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.

## Contributors

### Style Guide

All code must validate against JSlint.

### Testing

Mocha plus expect. All tests and functionality must run in Node.js and the
browser.

### Contributor's Agreement

All contribution to this project are protected by the contributors agreement
detailed in the CONTRIBUTING file. All contributors should read the file before
contributing, but as a summary:

    You give us the rights to distribute your code and we promise to maintain
    an open source release of anything you contribute.


[Promises/A+ specification]: <https://github.com/promises-aplus/promises-spec>