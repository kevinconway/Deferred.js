/*jslint node: true, indent: 2, passfail: true */
/*globals describe, it */

"use strict";

var expect = require('expect.js'),
  Deferred = require('../deferred/deferred.js');

describe('The Deferred library promises implement A+', function () {

  describe('Promise States', function () {

    describe('1. When pending, a promise', function () {

      it('1.1 may transition to the resolved state', function (done) {

        var d = new Deferred(),
          p = d.promise();

        p.then(function (v) {

          expect(v).to.be(true);
          done();

        });

        d.resolve(true);

      });

      it('1.2 may transition to the rejected state', function (done) {

        var d = new Deferred(),
          p = d.promise(),
          e = new TypeError();

        p.then(null, function (err) {

          expect(err).to.be(e);
          done();

        });

        d.reject(e);

      });

    });

    describe('2. When fulfilled, a promise', function () {

      it('2.1 must not transition to any other state', function (done) {

        var d = new Deferred(),
          p = d.promise(),
          e = new TypeError();

        p.then(function (v) {

          expect(v).to.be(true);
          d.reject(e);

          p.then(function (v) {

            expect(v).to.be(true);
            done();

          }, function () {

            expect().fail();
            done();

          });

        });

        d.resolve(true);

      });

      it('2.2 must have a value which must not change', function (done) {

        var d = new Deferred(),
          p = d.promise();

        p.then(function (v) {

          expect(v).to.be(true);
          d.resolve(false);

          p.then(function (v) {

            expect(v).to.be(true);
            done();

          });

        });

        d.resolve(true);

      });

    });

    describe('3. When rejected, a promise', function () {

      it('3.1 must not transition to any other state', function (done) {

        var d = new Deferred(),
          p = d.promise(),
          e = new TypeError();

        p.then(null, function (err) {

          expect(err).to.be(e);
          d.resolve(true);

          p.then(function () {

            expect().fail();
            done();

          }, function (err) {

            expect(err).to.be(e);
            done();

          });

        });

        d.reject(e);

      });

      it('3.2 must have a reason which must not change', function (done) {

        var d = new Deferred(),
          p = d.promise(),
          e1 = new TypeError(),
          e2 = new RangeError();

        p.then(null, function (err) {

          expect(err).to.be(e1);
          d.reject(e2);

          p.then(function () {

            expect().fail();
            done();

          }, function (err) {

            expect(err).to.be(e1);
            done();

          });

        });

        d.reject(e1);

      });

    });

  });

});

describe('The "then" Method', function () {

  describe('1. Both onFulfilled and onRejected are optional arguments', function () {

    it('1.1 If onFulfilled is not a function, it must be ignored.', function (done) {

      var d = new Deferred(),
        p = d.promise();

      p.then(null, function () {

        done();

      });

      d.reject(false);

    });

    it('1.2 If onRejected is not a function, it must be ignored.', function (done) {

      var d = new Deferred(),
        p = d.promise();

      p.then(function () {

        done();

      }, null);

      d.resolve(true);

    });

  });

  describe('2. If onFulfilled is a function', function () {

    it('2.1 must be called with promise\'s value as its first argument', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        testValue = {};

      p.then(function (v) {

        expect(v).to.be(testValue);
        done();

      });

      d.resolve(testValue);

    });

    it('2.2 must not be called before promise is fulfilled', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        testValue = { "test": false };

      p.then(function (v) {

        testValue.test = true;
        expect(v).to.be(testValue);
        done();

      });

      expect(testValue.test).to.be(false);
      d.resolve(testValue);

    });

    it('2.3 must not be called more than once', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        testValue = { "count": 0 };

      p.then(function (v) {

        expect(testValue.count).to.be(0);
        testValue.count = testValue.count + 1;
        expect(v).to.be(testValue);
        done();

      });

      d.resolve(testValue);

    });

  });

  describe('3. If onRejected is a function', function () {

    it('3.1 must be called with promise\'s reason as its first argument', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        e = new TypeError();

      p.then(null, function (err) {

        expect(err).to.be(e);
        done();

      });

      d.reject(e);

    });

    it('3.2 must not be called before promise is rejected', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        e = new TypeError(),
        testValue = { "test": false };

      p.then(null, function (err) {

        testValue.test = true;
        expect(err).to.be(e);
        done();

      });

      expect(testValue.test).to.be(false);
      d.reject(e);

    });

    it('3.3 must not be called more than once', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        e = new TypeError(),
        testValue = { "count": 0 };

      p.then(null, function (err) {

        expect(testValue.count).to.be(0);
        testValue.count = testValue.count + 1;
        expect(err).to.be(e);
        done();

      });

      d.reject(e);

    });

  });

  describe('4. onFulfilled or onRejected must be deferred', function () {

    it('4.1 onFulfilled must be deferred', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        testValue = { "test": false };

      p.then(function (v) {

        testValue.test = true;
        expect(v).to.be(testValue);
        done();

      });

      expect(testValue.test).to.be(false);
      d.resolve(testValue);
      expect(testValue.test).to.be(false);

    });

    it('4.2 onRejected must be deferred', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        testValue = { "test": false },
        e = new TypeError();

      p.then(null, function (err) {

        testValue.test = true;
        expect(err).to.be(e);
        done();

      });

      expect(testValue.test).to.be(false);
      d.reject(e);
      expect(testValue.test).to.be(false);

    });

  });

  describe('6. then may be called multiple times on the same promise', function () {

    it('6.1 onFulfilled callbacks must execute in order', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        testValue = { "count": 0 };

      p.then(function () {

        expect(testValue.count).to.be(0);
        testValue.count = testValue.count + 1;

      });

      p.then(function () {

        expect(testValue.count).to.be(1);
        testValue.count = testValue.count + 1;

      });

      p.then(function () {

        expect(testValue.count).to.be(2);
        done();

      });

      d.resolve(true);

    });

    it('6.1 onRejected callbacks must execute in order', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        e = new TypeError(),
        testValue = { "count": 0 };

      p.then(null, function () {

        expect(testValue.count).to.be(0);
        testValue.count = testValue.count + 1;

      });

      p.then(null, function () {

        expect(testValue.count).to.be(1);
        testValue.count = testValue.count + 1;

      });

      p.then(null, function () {

        expect(testValue.count).to.be(2);
        done();

      });

      d.reject(e);

    });

  });

  describe('7. then must return a promise', function () {

    it('7.1.1 if onFulfilled returns a value, resolve new promise with it', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        p2,
        testValue = {};

      p2 = p.then(function () {

        return testValue;

      });

      p2.then(function (v) {

        expect(v).to.be(testValue);
        done();

      });

      d.resolve(true);

    });

    it('7.1.2 if onRejected returns a value, resolve new promise with it', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        p2,
        testValue = {};

      p2 = p.then(null, function () {

        return testValue;

      });

      p2.then(function (v) {

        expect(v).to.be(testValue);
        done();

      });

      d.reject(new TypeError());

    });

    it('7.2.1 if onFulfilled throws, fail new promise with reason', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        p2,
        e = new TypeError();

      p2 = p.then(function () {

        throw e;

      });

      p2.then(null, function (err) {

        expect(err).to.be(e);
        done();

      });

      d.resolve(true);

    });

    it('7.2.2 if onRejected throws, fail new promise with reason', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        p2,
        e = new TypeError();

      p2 = p.then(null, function () {

        throw e;

      });

      p2.then(null, function (err) {

        expect(err).to.be(e);
        done();

      });

      d.reject(new RangeError());

    });

    it('7.5 if onFulfilled is not function, proxy resolved value', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        p2,
        testValue = {};

      p2 = p.then();

      p2.then(function (v) {

        expect(v).to.be(testValue);
        done();

      });

      d.resolve(testValue);

    });

    it('7.6 if onRejected is not function, proxy failed reason', function (done) {

      var d = new Deferred(),
        p = d.promise(),
        p2,
        e = new TypeError();

      p2 = p.then();

      p2.then(null, function (err) {

        expect(err).to.be(e);
        done();

      });

      d.reject(e);

    });

  });

});

describe('The Promise Resolution Procedure', function () {

  it('1. Reject with TypeError if promise resolved with itself', function (done) {

    var d = new Deferred();

    d.then(expect().fail, function () { done(); });

    d.resolve(d);

  });

  describe('2. If x is a promise, adopt its state', function () {

    it('2.1 + 2.2 Resolve the promise with the resolved value of x', function (done) {

      var d1 = new Deferred(),
        p1 = d1.promise(),
        d2 = new Deferred(),
        p2 = d2.promise(),
        testValue = {};

      p1.then(function (v) {

        expect(v).to.be(testValue);
        done();

      });

      d1.resolve(p2);
      d2.resolve(testValue);

    });

    it('2.1 + 2.3 Reject the promise with the rejected reason of x', function (done) {

      var d1 = new Deferred(),
        p1 = d1.promise(),
        d2 = new Deferred(),
        p2 = d2.promise(),
        e = new TypeError();

      p1.then(null, function (err) {

        expect(err).to.be(e);
        done();

      });

      d1.resolve(p2);
      d2.reject(e);

    });

  });

  describe('3. Otherwise, if x is an object or function', function () {

    it('3.1 - 3.3 Handle faulty foreign thenables', function (done) {

      var d1 = new Deferred(),
        p1 = d1.promise(),
        e = new RangeError(),
        p2 = { "then": function () { throw e; } };

      p1.then(null, function (err) {

        expect(err).to.be(e);
        done();

      });

      d1.resolve(p2);

    });

    it('3.4 If then is not a function, fulfill promise with x', function (done) {

      var d1 = new Deferred(),
        p1 = d1.promise(),
        p2 = { "then": true };

      p1.then(function (v) {

        expect(v).to.be(p2);
        done();

      });

      d1.resolve(p2);

    });

  });

  describe('4. If x is not an object or function, fulfill promise with x', function () {

    it('', function (done) {

      var d1 = new Deferred(),
        p1 = d1.promise();

      p1.then(function (v) {

        expect(v).to.be(1234);
        done();

      });

      d1.resolve(1234);

    });

  });

});
