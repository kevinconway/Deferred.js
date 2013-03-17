/*global require, define, module, describe, it, xit

*/
(function (ctx, factory) {
    "use strict";

    var env = factory.env,
        def = factory.def,
        deps = {
            amd: ['lib/expect', '../deferred/deferred'],
            node: ['./lib/expect', '../deferred/deferred.js'],
            browser: ['expect', 'Deferred']
        };

    def.call(ctx, 'spec/Deferred', deps[env], function (expect, Deferred) {

        describe('The Deferred library', function () {

            it('loads in the current environment (' + env + ')', function () {

                expect(Deferred).to.be.ok();

            });

            it('exposes a specification compliant interface', function () {

                expect(typeof Deferred).to.be("function");

                expect(typeof Deferred.Deferred).to.be("function");

                expect(typeof Deferred.Promise).to.be("function");

                expect(typeof Deferred.PromiseCollection).to.be("function");

            });

            it('handles async callbacks', function (done) {

                var t = new Deferred(),
                    successObject = {};

                t.callback(function (value) {

                    successObject.test = value;

                    expect(successObject.test).to.be(value);

                    expect(t.resolved).to.be(true);
                    expect(t.completed).to.be(true);

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

                    expect(t.failed).to.be(true);
                    expect(t.completed).to.be(true);

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

                p.callback(function (value) {
                    successObject.test = value;

                    expect(successObject.test).to.be(value);

                    expect(p.resolved()).to.be(true);
                    expect(p.completed()).to.be(true);

                    done();

                });

                expect(p.resolve).to.be(undefined);

                expect(successObject.test).to.be(undefined);

                t.resolve();

            });

            it('produces promise collections', function (done) {

                var d1 = new Deferred(),
                    d2 = new Deferred(),
                    d3 = new Deferred(),
                    t1 = d1.promise(),
                    t2 = d2.promise(),
                    t3 = d3.promise(),
                    c1 = new Deferred.PromiseCollection();

                c1.add("t1", t1).add("t2", t2).add("t3", t3);

                c1.callback(function (values) {
                    expect(values.t1).to.be(1);
                    expect(values.t2).to.be(2);
                    expect(values.t3).to.be(3);
                    done();
                });

                d1.resolve(1);
                d2.resolve(2);
                d3.resolve(3);

            });

        });

    });

}(this, (function (ctx) {
    "use strict";

    var currentEnvironment,
        generator;

    // Check the environment to determine the dependency management strategy.

    if (typeof define === "function" && !!define.amd) {

        currentEnvironment = 'amd';

    } else if (typeof require === "function" &&
                        module !== undefined && !!module.exports) {

        currentEnvironment = 'node';

    } else if (ctx.window !== undefined) {

        currentEnvironment = 'browser';

    }

    generator = (function () {
        switch (currentEnvironment) {

        case 'amd':

            // If RequireJS is used to load this module then return the global
            // define() function.
            return function (name, deps, mod) {
                define(deps, mod);
            };

        case 'node':

            // If this module is loaded in Node, require each of the
            // dependencies and pass them along.
            return function (name, deps, mod) {

                var x,
                    dep_list = [];

                for (x = 0; x < deps.length; x = x + 1) {

                    dep_list.push(require(deps[x]));

                }

                module.exports = mod.apply(ctx, dep_list);

            };

        case 'browser':

            // If this module is being used in a browser environment first
            // generate a list of dependencies, run the provided definition
            // function with the list of dependencies, and insert the returned
            // object into the global namespace using the provided module name.
            return function (name, deps, mod) {

                var namespaces = name.split('/'),
                    root = ctx,
                    dep_list = [],
                    current_scope,
                    current_dep,
                    i,
                    x;

                for (i = 0; i < deps.length; i = i + 1) {

                    current_scope = root;
                    current_dep = deps[i].split('/');

                    for (x = 0; x < current_dep.length; x = x + 1) {

                        current_scope = current_scope[current_dep[x]] || {};

                    }

                    dep_list.push(current_scope);

                }

                current_scope = root;
                for (i = 1; i < namespaces.length; i = i + 1) {

                    current_scope = current_scope[namespaces[i - 1]] =
                                    current_scope[namespaces[i - 1]] || {};

                }

                current_scope[namespaces[i - 1]] = mod.apply(ctx, dep_list);

            };

        default:
            throw new Error("Unrecognized environment.");

        }

    }());


    return {
        env: currentEnvironment,
        def: generator
    };

}(this))));
