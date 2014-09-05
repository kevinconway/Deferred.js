/*jslint node: true, indent: 2, passfail: true */
"use strict";

var util = require('util'),
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite("Calling 'then()' Multiple Times"),
  Deferred = require('../versions/current'),
  Deferred_7_1_2 = require('../versions/7.1.2'),
  Bluebird = require('bluebird'),
  print = require('../print');

Benchmark.options.minSamples = 100;

suite.add(
  'deferredjs vCurrent',
  function () {
    var d = new Deferred();
    d.then();
    d.then();
    d.then();
    return d;
  }
);

suite.add(
  'deferredjs v7.1.2',
  function () {
    var d = new Deferred_7_1_2();
    d.then();
    d.then();
    d.then();
    return d;
  }
);

suite.add(
  'bluebird vCurrent',
  function () {
    var d = new Bluebird(function () {});
    d.then();
    d.then();
    d.then()
    return d;
  }
);

suite.on('complete', print);

suite.run();
