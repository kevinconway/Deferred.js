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

  var Deferred = require('./deferred'),
    AnyCollection,
    AllCollection;

  AnyCollection = function AnyCollection() {

    var args = Array.prototype.slice.call(arguments),
      d = new Deferred(),
      x;

    args.reverse();
    for (x = args.length - 1; x >= 0; x = x - 1) {

      args[x].then(
        d.resolve.bind(d),
        d.reject.bind(d)
      );

    }

    return d.promise();

  };

  AllCollection = function AllCollection() {

    var args = Array.prototype.slice.call(arguments),
      d = new Deferred(),
      values = [],
      count = { "value": 0 },
      x;

    function resolve(offset, value) {

      values[offset] = value;
      count.value = count.value + 1;

      if (count.value >= args.length) {

        d.resolve(values);

      }

    }

    for (x = args.length - 1; x >= 0; x = x - 1) {

      args[x].then(
        resolve.bind(undefined, x),
        d.reject.bind(d)
      );

    }

    return d.promise();

  };

  return {
    "All": AllCollection,
    "Any": AnyCollection
  };

}());
