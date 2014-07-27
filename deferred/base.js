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

  var modelo = require('modelo'),
    defer = require('deferjs'),
    xbind = defer.bind,
    CallbackAggregator,
    SingleUseCallbackAggregator,
    Resolvable,
    Rejectable;

  CallbackAggregator = modelo.define(function () {
    this.callbacks = [];
  });

  CallbackAggregator.prototype.add = function add(fn) {

    if (typeof fn !== 'function') {

      throw new TypeError("Callbacks must be functions.");

    }

    this.callbacks.push(fn);
    return this;

  };

  CallbackAggregator.prototype.execute = function execute() {

    var x,
      args = Array.prototype.slice.call(arguments),
      fnArgs;

    args.unshift(undefined);

    for (x = 0; x < this.callbacks.length; x = x + 1) {

      fnArgs = args.slice(0);
      fnArgs.unshift(this.callbacks[x]);
      defer(xbind.apply(undefined, fnArgs));

    }
    return this;

  };

  SingleUseCallbackAggregator = CallbackAggregator.extend(function () {

    this.used = false;
    this.args = [undefined];

  });

  SingleUseCallbackAggregator.prototype.add = function add(fn) {

    var args;

    if (this.used === true) {

      args = this.args.slice(0);
      args.unshift(fn);
      defer(xbind.apply(undefined, args));
      return this;

    }

    return CallbackAggregator.prototype.add.call(this, fn);

  };

  SingleUseCallbackAggregator.prototype.execute = function execute() {

    if (this.used === true) {

      return this;

    }

    this.used = true;
    this.args = Array.prototype.slice.call(arguments);
    this.args.unshift(undefined);
    return CallbackAggregator.prototype.execute.apply(this, arguments);

  };

  Resolvable = modelo.define(function () {

    this.callbacks = new SingleUseCallbackAggregator();
    this.resolved = false;
    this.value = undefined;

  });
  Rejectable = modelo.define(function () {

    this.errbacks = new SingleUseCallbackAggregator();
    this.rejected = false;
    this.reason = undefined;

  });

  Resolvable.prototype.callback = function callback(fn) {

    this.callbacks.add(fn);
    return this;

  };
  Rejectable.prototype.errback = function errback(fn) {

    this.errbacks.add(fn);
    return this;

  };

  Resolvable.prototype.complete = function complete() {

    return this.resolved === true;

  };
  Rejectable.prototype.complete = function complete() {

    return this.rejected === true;

  };

  Resolvable.prototype.resolve = function resolve(value) {

    if (this.complete() === true) {

      return this;

    }

    this.value = value;
    this.resolved = true;
    this.callbacks.execute(value);
    return this;

  };
  Rejectable.prototype.reject = function reject(reason) {

    if (this.complete() === true) {

      return this;

    }

    this.reason = reason;
    this.rejected = true;
    this.errbacks.execute(reason);

  };

  return {
    "Resolvable": Resolvable,
    "Rejectable": Rejectable,
    "SingleUseCallbackAggregator": SingleUseCallbackAggregator,
    "CallbackAggregator": CallbackAggregator
  };

}());
