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

  var defer = require('deferjs');

  // Wrapper generator which ensures only one of the wrapped functions is
  // executed and is executed only once.
  function chooseOne(thisArg) {
    var state = { "ran": false };
    return function chooseOne(fn) {
      return function chooseOne() {
        if (state.ran === false) {
          state.ran = true;
          fn.apply(thisArg, arguments);
        }
      };
    };
  }
  // Method that promises can use to identify themselves as having been
  // produced by a deferred without exposes access to the deferred.
  function isFromDeferred(possible) {
    return this === possible;
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
  Deferred.prototype.rejectDeferreds = function rejectDeferreds() {
    var next;
    while (this.thens.length > 0) {
      next = this.thens.shift();
      try {
        if (this.multipleValues === true) {
          next.promise.resolve(next.onReject.apply(undefined, this.value));
        } else {
          next.promise.resolve(next.onReject.call(undefined, this.value));
        }
      } catch (err) {
        next.promise.reject(err);
      }
    }
  };
  Deferred.prototype.resolveDeferreds = function resolveDeferreds() {
    var next;
    while (this.thens.length > 0) {
      next = this.thens.shift();
      try {
        if (this.multipleValues === true) {
          next.promise.resolve(next.onResolve.apply(undefined, this.value));
        } else {
          next.promise.resolve(next.onResolve.call(undefined, this.value));
        }
      } catch (err) {
        next.promise.reject(err);
      }
    }
  };
  Deferred.prototype.rejectWithReason = function rejectWithReason(reason) {
    // Set state to rejected.
    this.state = -2;
    if (arguments.length === 1) {
      this.value = reason;
    } else {
      this.multipleValues = true;
      this.value = arguments;
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
  Deferred.prototype.resolveWithValue = function resolveWithValue(value) {
    // If complete, don't do any more.
    if (this.state === -2 || this.state === 2) {
      return;
    }
    var lock = chooseOne(this), then;
    if (!!value && (typeof value === 'function' || typeof value === 'object')) {
      try {
        then = value.then;
        if (typeof then === 'function') {
          // Set state to resolving
          then.call(
            value,
            lock(this.resolveWithValue),
            lock(this.rejectWithReason)
          );
          return;
        }
      } catch (err) {
        lock(this.rejectWithReason)(err);
        return;
      }
    }
    // Set state to resolved.
    this.state = 2;
    if (arguments.length === 1) {
      this.value = value;
    } else {
      this.multipleValues = true;
      this.value = arguments;
    }
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
    this.resolveWithValue.apply(this, arguments);
  };
  Deferred.prototype.then = function then(onResolve, onReject) {
    var p = new Deferred();
    this.thens.push({
      'onResolve': typeof onResolve === 'function' ? onResolve : p.resolve.bind(p),
      'onReject': typeof onReject === 'function' ? onReject : p.reject.bind(p),
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
    return {
      "then": this.then.bind(this),
      "callback": this.callback.bind(this),
      "errback": this.errback.bind(this),
      "isFromDeferred": isFromDeferred.bind(this)
    };
  };

  return Deferred;

}());
