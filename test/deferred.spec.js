/*jslint node: true, indent: 2, passfail: true */
/*globals describe, it */

(function (context, generator) {
  "use strict";

  generator.call(
    context,
    'deferredjs',
    ['expect', 'deferredjs'],
    function (expect, Deferred) {

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

      });
    }
  );

}(this, (function (context) {
  "use strict";

  // Ignoring the unused "name" in the Node.js definition function.
  /*jslint unparam: true */
  if (typeof require === "function" &&
        module !== undefined &&
        !!module.exports) {

    // If this module is loaded in Node, require each of the
    // dependencies and pass them along.
    return function (name, deps, mod) {

      var x,
        dep_list = [];

      for (x = 0; x < deps.length; x = x + 1) {

        dep_list.push(require(deps[x]));

      }

      module.exports = mod.apply(context, dep_list);

    };

  }
  /*jslint unparam: false */

  if (context.window !== undefined) {

    // If this module is being used in a browser environment first
    // generate a list of dependencies, run the provided definition
    // function with the list of dependencies, and insert the returned
    // object into the global namespace using the provided module name.
    return function (name, deps, mod) {

      var namespaces = name.split('/'),
        root = context,
        dep_list = [],
        current_scope,
        current_dep,
        i,
        x;

      for (i = 0; i < deps.length; i = i + 1) {

        current_scope = root;
        current_dep = deps[i].split('/');

        for (x = 0; x < current_dep.length; x = x + 1) {

          current_scope = current_scope[current_dep[x]] =
                          current_scope[current_dep[x]] || {};

        }

        dep_list.push(current_scope);

      }

      current_scope = root;
      for (i = 1; i < namespaces.length; i = i + 1) {

        current_scope = current_scope[namespaces[i - 1]] =
                        current_scope[namespaces[i - 1]] || {};

      }

      current_scope[namespaces[i - 1]] = mod.apply(context, dep_list);

    };

  }

  throw new Error("Unrecognized environment.");

}(this))));
