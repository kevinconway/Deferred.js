/*jslint node: true, indent: 2, passfail: true */
/*globals describe, xdescribe, it, xit */

"use strict";

var expect = require('expect.js'),
  Thenable = require('../deferred/thenable').Thenable,
  upstream_tests = require('promises-aplus-tests');

describe("Upstream Promises/A+ Tests", function () {

  describe("Running against the Thenable object", function () {

    var adapter = {
      "resolved": function (value) {
        var d = new Thenable();
        d.resolve(value);
        return d;
      },
      "rejected": function (reason) {
        var d = new Thenable();
        d.reject(reason);
        return d;
      },
      "deferred": function () {
        var d = new Thenable();
        return {
          "promise": d,
          "resolve": d.resolve.bind(d),
          "reject": d.reject.bind(d)
        };
      }
    };
    upstream_tests.mocha(adapter);

  });

});
