/*jslint node: true, indent: 2, passfail: true */
"use strict";

var util = require('util'),
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite("Resolving Promise Value"),
  Deferred = require('../versions/current'),
  Deferred_7_1_2 = require('../versions/7.1.2'),
  Bluebird = require('bluebird'),
  print = require('../print');

Benchmark.options.minSamples = 100;

suite.add(
  'deferredjs vCurrent',
  {
    "defer": true,
    "fn": function (d) {
      var dt = new Deferred(),
        dt2 = new Deferred();
      dt2.resolve(true);
      dt.resolve(dt2);
      dt.then(d.resolve.bind(d));
    }
  }
);

suite.add(
  'deferredjs v7.1.2',
  {
    "defer": true,
    "fn": function (d) {
      var dt = new Deferred_7_1_2(),
        dt2 = new Deferred_7_1_2();
      dt2.resolve(true);
      dt.resolve(dt2);
      dt.then(d.resolve.bind(d));
    }
  }
);

suite.add(
  'bluebird vCurrent',
  {
    "defer": true,
    "fn": function (d) {
      var dt = new Bluebird(function (r) { r(true); }),
        dt2 = new Bluebird(function (r) { r(dt); });
      dt2.then(d.resolve.bind(d));
    }
  }
);

suite.on('complete', print);
suite.on('error', console.log);

suite.run();
