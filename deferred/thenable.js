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

  var defer = require('deferjs'),
    xbind = defer.bind,
    modelo = require('modelo'),
    Resolvable = require('./base').Resolvable,
    Rejectable = require('./base').Rejectable,
    locks = require('./locks'),
    Thenable;

  function resolveOrReject(thenable, fn, input) {

    try {

      thenable.resolve(fn(input));

    } catch (err) {

      thenable.reject(err);

    }

  }

  function isNativeThenable(thenable) {

    return (
      !!thenable &&
      !!thenable.isInstance &&
      typeof thenable.isInstance === 'function' &&
      thenable.isInstance(Thenable)
    );

  }

  // Return false if not thenable. Otherwise return a bound `then` function.
  function isThenable(thenable) {

    var then;

    if (!!thenable) {

      if (typeof thenable === 'function' || typeof thenable === 'object') {

        then = thenable.then;

        if (typeof then === 'function') {

          return xbind(then, thenable);

        }

      }

    }

    return false;

  }

  Thenable = modelo.define(Resolvable, Rejectable, function () {

    this.pending = true;

  });

  Thenable.prototype.complete = function complete() {

    return this.resolved === true || this.rejected === true;

  };

  // A+ compliant then method. Relevant specification text included where
  // appropriate.
  Thenable.prototype.then = function then(onResolved, onRejected) {
    // Both onFulfilled and onRejected are optional arguments.
    // `then` may be called multiple times on the same promise.

    var nextThenable = new Thenable();

    // If onFulfilled is a function:
    // It must be called after promise is fulfilled, with promise's value as
    // its first argument.
    // It must not be called before promise is fulfilled.
    // It must not be called more than once.
    if (typeof onResolved === 'function') {

      // onFulfilled must not be called until the execution context stack
      // contains only platform code.
      // onFulfilled must be called as a functions (i.e. with no this value).
      // If/when promise is fulfilled, all respective onFulfilled callbacks
      // must execute in the order of their originating calls to then.
      this.callback(
        xbind(
          // If onFulfilled returns a value x, run the Promise Resolution
          // Procedure [[Resolve]](promise2, x).
          // If onFulfilled throws an exception e, promise2 must be rejected
          // with e as the reason.
          resolveOrReject,
          undefined,
          nextThenable,
          onResolved
        )
      );

    // If onFulfilled is not a function, it must be ignored.
    } else {

      // If onFulfilled is not a function and promise1 is fulfilled, promise2
      // must be fulfilled with the same value as promise1.
      this.callback(xbind(nextThenable.resolve, nextThenable));

    }

    // If onRejected is a function:
    // It must be called after promise is rejected, with promise's reason as
    // its first argument.
    // It must not be called before promise is rejected.
    // It must not be called more than once.
    if (typeof onRejected === 'function') {

      // onRejected must not be called until the execution context stack
      // contains only platform code.
      // onRejected must be called as a functions (i.e. with no this value).
      // If/when promise is rejected, all respective onRejected callbacks must
      // execute in the order of their originating calls to then.
      this.errback(
        xbind(
          // If onRejected returns a value x, run the Promise Resolution
          // Procedure [[Resolve]](promise2, x).
          // If onRejected throws an exception e, promise2 must be rejected
          // with e as the reason.
          resolveOrReject,
          undefined,
          nextThenable,
          onRejected
        )
      );

    // If onRejected is not a function, it must be ignored.
    } else {

      // If onRejected is not a function and promise1 is rejected, promise2
      // must be rejected with the same reason as promise1.
      this.errback(xbind(nextThenable.reject, nextThenable));

    }

    // `then` must return a promise.
    return nextThenable;

  };

  Thenable.prototype.resolveValue = function resolveValue(value) {

    var then,
      lock = locks.runOne();

    // If promise and x refer to the same object, reject promise with a
    // TypeError as the reason.
    if (value === this) {

      Rejectable.prototype.reject.call(
        this,
        new TypeError("Cannot resolve a promise with itself.")
      );
      return this;

    }

    try {

      then = isThenable(value);

      if (then === false) {

        // If then is not a function, fulfill promise with x.
        // If x is not an object or function, fulfill promise with x.
        Resolvable.prototype.resolve.call(this, value);
        return this;

      }

      then(
        // NOTE: Specification requires that two handlers be passed in here.
        lock(locks.runOnce(xbind(this.resolveValue, this))),
        lock(xbind(Rejectable.prototype.reject, this))
      );

    } catch (err) {

      lock(xbind(Rejectable.prototype.reject, this, err))();

    }

  };

  // Implementation of the Promise Resolution Procedure. Relevant specification
  // text included where appropriate.
  Thenable.prototype.resolve = function resolve(value) {

    if (this.pending === false) {

      return this;

    }

    this.pending = false;
    this.resolveValue(value);
    return this;

  };

  Thenable.prototype.reject = function rejected(reason) {

    if (this.pending === false) {

      return this;

    }

    this.pending = false;
    Rejectable.prototype.reject.call(this, reason);
    return this;

  };

  return {
    "Thenable": Thenable,
    "isNativeThenable": isNativeThenable,
    "isThenable": isThenable
  };

}());
