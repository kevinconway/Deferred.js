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
    chooseOne = require('./utility').chooseOne,
    tryCatch = require('./utility').tryCatch,
    args = require('./utility').args;

  // Default onResolve and onReject methods.
  function passResult(r) {
    return r;
  }
  function passError(e) {
    throw e;
  }
  function Deferred() {
    this.thens = [];
    // -2 => rejected, -1 => rejecting
    // 0 => pending
    // 2 => resolved, 1 => resolving
    this.state = 0;
    this.value = undefined;
    this.multipleValues = false;
  }
  function Resolver(promise, provider, value, multiple) {
    return function () {
      if (multiple) {
        promise.resolve(provider.apply(undefined, value));
        return undefined;
      }
      promise.resolve(provider.call(undefined, value));
    };
  }
  function Rejector(promise) {
    return function (err) {
      promise.reject(err);
    };
  }
  Deferred.prototype.rejectDeferreds = function rejectDeferreds() {
    var next;
    while (this.thens.length > 0) {
      next = this.thens.shift();
      tryCatch(
        new Resolver(next.promise, next.onReject, this.value, this.multipleValues),
        new Rejector(next.promise)
      );
    }
  };
  Deferred.prototype.resolveDeferreds = function resolveDeferreds() {
    var next;
    while (this.thens.length > 0) {
      next = this.thens.shift();
      tryCatch(
        new Resolver(next.promise, next.onResolve, this.value, this.multipleValues),
        new Rejector(next.promise)
      );
    }
  };
  Deferred.prototype.rejectWithReason = function rejectWithReason(reason) {
    // Set state to rejected.
    this.state = -2;
    this.value = reason;
    if (arguments.length > 1) {
      this.value = args.apply(undefined, arguments);
      this.multipleValues = true;
    }
    defer(this.rejectDeferreds.bind(this));
  };
  Deferred.prototype.reject = function reject() {
    if (this.state !== 0) {
      return;
    }
    // Set state to rejecting.
    this.state = -1;
    this.rejectWithReason.apply(this, arguments);
  };
  Deferred.prototype.resolveWithDispatch = function resolveWithDispatch() {
    if (this.state === -2 || this.state === 2) {
      return;
    }
    if (arguments.length > 1) {
      this.resolveWithValues.apply(this, arguments);
      return;
    }
    this.resolveWithValue.apply(this, arguments);
  };
  Deferred.prototype.resolveWithValues = function resolveWithValues() {
    this.state = 2;
    this.value = args.apply(undefined, arguments);
    this.multipleValues = true;
    defer(this.resolveDeferreds.bind(this));
  };
  Deferred.prototype.resolveWithValue = function resolveWithValue(value) {
    var lock = chooseOne(this), stop,
      reject = lock(this.rejectWithReason),
      resolve = lock(this.resolveWithValue);

    function tryThenable() {
      var then = value.then;
      if (typeof then === 'function') {
        then.call(value, resolve, reject);
        return true;
      }
      return false;
    }
    function catchThenable(err) {
      reject(err);
      return true;
    }
    if (!!value && (typeof value === 'function' || typeof value === 'object')) {
      stop = tryCatch(tryThenable, catchThenable);
      if (stop === true) {
        return;
      }
    }
    // Set state to resolved.
    this.state = 2;
    this.value = value;
    defer(this.resolveDeferreds.bind(this));
  };
  Deferred.prototype.resolve = function resolve(value) {
    // Only allow resolve once.
    if (this.state !== 0) {
      return;
    }
    if (value === this ||
        (!!value && !!value.isFromDeferred &&
        value.isFromDeferred(this))) {
      this.rejectWithReason(new TypeError("Self resolution."));
      return;
    }
    // Set state to resolving.
    this.state = 1;
    this.resolveWithDispatch.apply(this, arguments);
  };
  Deferred.prototype.then = function then(onResolve, onReject) {
    var p = new Deferred();
    this.thens.push({
      'onResolve': typeof onResolve === 'function' ? onResolve : passResult,
      'onReject': typeof onReject === 'function' ? onReject : passError,
      'promise': p
    });
    // If complete, simply execute the resolution/rejection.
    if (this.state === -2) {
      defer(this.rejectDeferreds.bind(this));
    }
    if (this.state === 2) {
      defer(this.resolveDeferreds.bind(this));
    }
    // Return promises from 'then' to prevent outside resolution of the
    // deferred.
    return p.promise();
  };
  // Helper method for just adding a callback (onResolve).
  Deferred.prototype.callback = function callback(fn) {
    return this.then(fn);
  };
  // Helper method for just adding an errback (onReject).
  Deferred.prototype.errback = function errback(fn) {
    return this.then(undefined, fn);
  };
  // Produce a new interface for the deferred that cannot be resolved or
  // rejected.
  Deferred.prototype.promise = function promise() {
    // Using a reference to this because defining these functions using a scope
    // closure is measurable faster than using bind.
    var self = this;
    function then(res, rej) {
      return self.then(res, rej);
    }
    function callback(res) {
      return self.callback(res);
    }
    function errback(rej) {
      return self.errback(rej);
    }
    function isFrom(p) {
      return self === p;
    }
    return {
      "then": then,
      "callback": callback,
      "errback": errback,
      "isFromDeferred": isFrom
    };

  };

  return Deferred;

}());
