/*jslint node: true, indent: 2, passfail: true */
"use strict";

var util = require('util'),
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite("Calling 'then()'"),
  Deferred = require('../versions/current'),
  Deferred_7_1_2 = require('../versions/7.1.2'),
  Bluebird = require('bluebird'),
  print = require('../print');

Benchmark.options.minSamples = 100;

suite.add(
  'deferredjs vCurrent',
  function () {
    return (new Deferred()).then();
  }
);

suite.add(
  'deferredjs v7.1.2',
  function () {
    return (new Deferred_7_1_2()).then();
  }
);

suite.add(
  'bluebird vCurrent',
  function () {
    return (new Bluebird(function () {})).then();
  }
);

suite.on('complete', print);

suite.run();
