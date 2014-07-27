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

  // Wrapper which ensures a function is only called once.
  // Repeated calls are ignored.
  function runOnce(fn) {

    var state = { "ran": false };

    return function onceRunner() {

      if (state.ran === false) {

        state.ran = true;
        fn.apply(undefined, arguments);

      }

    };

  }

  // Utility for ensuring only one method out of a selection is run
  // Function produces a wrapper that can be applied to multiple functions.
  function runOne() {

    var state = { "ran": false };

    return function oneRunnerGenerator(fn) {

      return function oneRunner() {

        if (state.ran === false) {

          state.ran = true;
          fn.apply(undefined, arguments);

        }

      };

    };

  }

  return {
    "runOnce": runOnce,
    "runOne": runOne
  };

}());
