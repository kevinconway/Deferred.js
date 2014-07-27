/*
The MIT License (MIT)
Copyright (c) 2013 Kevin Conway

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*jslint node: true, indent: 2, passfail: true */

"use strict";

module.exports = (function () {

  var xbind = require('deferjs').bind,
    Rejectable = require('./base').Rejectable,
    Resolvable = require('./base').Resolvable,
    thenable = require('./thenable'),
    Thenable = thenable.Thenable,
    Promise,
    Deferred;

  Promise = Thenable.extend();
  Promise.prototype.resolve = undefined;
  Promise.prototype.reject = undefined;
  Promise.prototype.resolveValue = undefined;

  // Private method to check if a promise came from a given deferred.
  function isFrom(d) {

    return d === this;

  }

  Deferred = Thenable.extend();
  Deferred.prototype.promise = function promise() {

    var p = new Promise();
    this.then(
      xbind(Resolvable.prototype.resolve, p),
      xbind(Rejectable.prototype.reject, p)
    );
    p.isFrom = xbind(isFrom, this);

    return p;

  };
  Deferred.prototype.resolveValue = function resolveValue(value) {

    if (!!value && !!value.isFrom && typeof value.isFrom === 'function') {

      if (value.isFrom(this)) {

        Rejectable.prototype.reject.call(
          this,
          new TypeError("Cannot resolve a promise with itself.")
        );
        return this;

      }

    }

    Thenable.prototype.resolveValue.call(this, value);
    return this;

  };

  return Deferred;

}());
