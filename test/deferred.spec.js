/*jslint node: true, indent: 2, passfail: true */
/*globals describe, it */

"use strict";

var expect = require('expect.js'),
  Deferred = require('../deferred/deferred.js');

describe('The Deferred library', function () {

  it('loads in the current environment', function () {

    expect(Deferred).to.be.ok();

  });

  it('exposes a specification compliant interface', function () {

    expect(typeof Deferred).to.be("function");

    expect(typeof Deferred.Deferred).to.be("function");

    expect(typeof Deferred.Promise).to.be("function");

    expect(typeof Deferred.Collection).to.be("object");

    expect(typeof Deferred.Collection.All).to.be("function");

    expect(typeof Deferred.Collection.Any).to.be("function");

    expect(typeof Deferred.convert).to.be("function");

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

    t.fail(true);

    expect(errorObject.test).to.be(undefined);

  });

  it('produces a limited promise object', function (done) {

    var t = new Deferred(),
      p = t.promise(),
      successObject = {};

    expect(p.callback).to.be.ok(t.callback);
    expect(p.value).to.be(undefined);
    expect(p.callbacks).to.be(undefined);
    expect(p.errbacks).to.be(undefined);

    p.callback(function (value) {
      successObject.test = value;

      expect(successObject.test).to.be(value);

      done();

    });

    expect(p.resolve).to.be(undefined);

    expect(successObject.test).to.be(undefined);

    t.resolve();

  });

  describe('The Any Collection', function () {

    it('Resolves on the first resolved promise.', function (done) {

      var d1 = new Deferred(),
        d2 = new Deferred(),
        d3 = new Deferred(),
        c = Deferred.Collection.Any(d1, d2, d3);

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
        c = Deferred.Collection.All(d1, d2, d3);

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

  describe('The convert function', function () {

    it('transforms normal functions to produce promises', function (done) {

      var p = Deferred.convert(function () { return false; })();

      expect(p).to.be.ok();
      expect(p.then).to.be.ok();
      expect(p.callback).to.be.ok();
      expect(p.errback).to.be.ok();

      p.callback(function (v) {

        expect(v).to.be(false);
        done();
      });

    });

    it('converts exceptions to rejections', function (done) {

      var e = new SyntaxError(),
        p = Deferred.convert(function () { throw e; })();

      p.errback(function (r) {

        expect(r).to.be(e);
        done();
      });

    });

    it('passes promises through unchanged', function (done) {

      var d = new Deferred(),
        p1 = d.promise(),
        p2 = Deferred.convert(function () { return p1; })();

      p2.callback(function (v) {

        expect(v).to.be(false);
        done();

      });

      d.resolve(false);

    });

  });

});

