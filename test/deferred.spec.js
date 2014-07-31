/*jslint node: true, indent: 2, passfail: true */
/*globals describe, it */

"use strict";

var expect = require('expect.js'),
  dns = require('dns'),
  pkg = require('../deferred/index'),
  Deferred = pkg.Deferred,
  collection = pkg.collection,
  when = pkg.when,
  convert = pkg.convert;

describe('The Deferred library', function () {

  it('loads in the current environment', function () {

    expect(Deferred).to.be.ok();

  });

  it('handles async callbacks', function (done) {

    var t = new Deferred(),
      successObject = {};

    t.callback(function (value) {

      successObject.test = value;

      expect(successObject.test).to.be(value);

      done();

    });

    t.resolve(true);

    expect(successObject.test).to.be(undefined);

  });

  it('handles async errbacks', function (done) {

    var t = new Deferred(),
      errorObject = {};

    t.errback(function (value) {

      errorObject.test = value;

      expect(errorObject.test).to.be(value);

      done();

    });

    t.reject(true);

    expect(errorObject.test).to.be(undefined);

  });

  it('produces a limited promise object', function (done) {

    var t = new Deferred(),
      p = t.promise(),
      successObject = {};

    expect(p.resolve).to.be(undefined);
    expect(p.reject).to.be(undefined);

    p.callback(function (value) {
      successObject.test = value;

      expect(successObject.test).to.be(value);

      done();

    });

    expect(successObject.test).to.be(undefined);

    t.resolve();

  });

  describe('The Any Collection', function () {

    it('Resolves on the first resolved promise.', function (done) {

      var d1 = new Deferred(),
        d2 = new Deferred(),
        d3 = new Deferred(),
        c = collection.Any(d1, d2, d3);

      c.callback(function (value) {

        expect(value).to.be(true);
        done();

      });

      d1.resolve(true);
      d2.resolve(false);
      d3.resolve(false);

    });

  });

  describe('The All Collection', function () {

    it('Resolves after all promises', function (done) {

      var d1 = new Deferred(),
        d2 = new Deferred(),
        d3 = new Deferred(),
        c = collection.All(d1, d2, d3);

      c.callback(function (values) {

        expect(values.length).to.be(3);
        expect(values[0]).to.be(true);
        expect(values[1]).to.be(false);
        expect(values[2]).to.be(null);
        done();

      });

      d1.resolve(true);
      d2.resolve(false);
      d3.resolve(null);

    });

  });

  describe('The when function', function () {

    it('transforms normal values into promises', function (done) {

      var p = when(false);

      expect(p).to.be.ok();
      expect(p.then).to.be.ok();

      p.then(function (v) {

        expect(v).to.be(false);
        done();
      });

    });

    it('passes promises through unchanged', function (done) {

      var d = new Deferred(),
        p1 = d.promise(),
        p2 = when(p1);

      p2.then(function (v) {

        expect(v).to.be(false);
        done();

      });

      d.resolve(false);

    });

  });

  describe('The convert function', function () {

    it('handles callbacks for Node.js style functions', function (done) {

      var c = convert(dns.resolve4);

      c('google.com').then(function (addresses) {
        expect(addresses).to.be.ok();
        done();
      });

    });

  });

});

