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

  var pkg = {
      "Deferred": require('./deferred'),
      "collection": require('./collection')
    };

  // Convert a thenable into a native promise. If value is not thenable the
  // promise comes pre-resolved with the value.
  function when(thenable) {

    var t = new pkg.Deferred(),
      then,
      isThenable;

    isThenable = (
      !!thenable &&
      (typeof thenable === 'function' || typeof thenable === 'object')
    );

    if (isThenable === true) {
      then = thenable.then;
      isThenable = typeof then === 'function';
    }

    if (!!then && isThenable === true) {
      then.call(
        thenable,
        t.resolve.bind(t),
        t.reject.bind(t)
      );
    } else {
      t.resolve(thenable);
    }

    return t.promise();

  }

  pkg.when = when;

  return pkg;

}());
