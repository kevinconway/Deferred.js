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

(function (context, generator) {
  "use strict";

  generator.call(
    context,
    'deferredjs',
    ['modelo', 'deferjs'],
    function (Modelo, defer) {

      var Deferred,
        DeferredObject,
        PromiseObject,
        CollectionModule;

      function executeAndReturnPromise(fn) {

        var fnPromise,
          args = Array.prototype.slice.call(arguments, 1),
          d = new DeferredObject();

        try {

          fnPromise = fn.apply(null, args);
          if (!!fnPromise && !!fnPromise.then &&
              typeof fnPromise.then === 'function') {

            return fnPromise;

          }

          d.resolve(fnPromise);

        } catch (e) {

          d.fail(e);

        }

        return d.promise();

      }

      function convert(fn) {

        return defer.bind(executeAndReturnPromise, null, fn);

      }

      function proxy(deferred, fn) {

        var args = Array.prototype.slice.call(arguments, 2),
          p = convert(fn).apply(null, args);

        p.callback(defer.bind(deferred.resolve, deferred));
        p.errback(defer.bind(deferred.fail, deferred));

      }

      PromiseObject = Modelo.define(function (options) {

        this.callback = function (fn) {
          options.deferred.callback(fn);
          return this;
        };
        this.done = this.callback;
        this.succeess = this.callback;

        this.errback = function (fn) {
          options.deferred.errback(fn);
          return this;
        };
        this.failure = this.errback;
        this.error = this.errback;

        this.then = function then(cback, eback) {
          return options.deferred.then(cback, eback);
        };

      });

      DeferredObject = Modelo.define(function () {

        this.callbacks = [];
        this.errbacks = [];
        this.resolved = false;
        this.failed = false;

      });

      // This method, and its aliases `success` and `done`, can be used
      // to register a callbcak function with the deferred. All callbacks
      // registered using this method, or its aliases, are passed in a
      // single value as input. This input parameter is the resolved
      // value for the deferred.
      DeferredObject.prototype.callback = function (fn) {

        if (this.failed === true) {

          return this;

        }

        if (this.resolved === true) {

          defer(defer.bind(fn, null, this.value));
          return this;

        }

        if (typeof fn === "function") {

          this.callbacks.push(fn);
          return this;

        }

        throw new TypeError("Callback must be a function.");

      };
      DeferredObject.prototype.succeess = DeferredObject.prototype.callback;
      DeferredObject.prototype.done = DeferredObject.prototype.callback;


      // This method, and its aliases `failure` and `error`, can be used
      // to register errbacks with the deferred that are executed when
      // an error is thrown. Callbacks registered using this method, and
      // its aliases, are passed a single input parameter that contains
      // the error that was thrown.
      DeferredObject.prototype.errback = function (fn) {

        if (this.resolved === true) {

          return this;

        }

        if (this.failed === true) {

          defer(defer.bind(fn, null, this.value));
          return this;

        }

        if (typeof fn === "function") {

          this.errbacks.push(fn);
          return this;

        }

        throw new TypeError("Errback must be a function.");

      };
      DeferredObject.prototype.failure = DeferredObject.prototype.errback;
      DeferredObject.prototype.error = DeferredObject.prototype.errback;

      DeferredObject.prototype.then = function then(callback, errback) {

        var d = new DeferredObject();

        if (typeof callback !== 'function') {

          callback = defer.bind(d.resolve, d);

        } else {

          callback = defer.bind(proxy, null, d, callback);

        }

        if (typeof errback !== 'function') {

          errback = defer.bind(d.fail, d);

        } else {

          errback = defer.bind(proxy, null, d, errback);

        }

        this.callback(callback);
        this.errback(errback);

        return d.promise();

      };

      // This method is used to mark the deferred as resolved and
      // to execute all the success callbacks registered. The value
      // passed to this method is the value that will be passed to
      // all callbacks.
      //
      // This method only triggers the callbacks once after which
      // neither it nor the `fail` method have any effect.
      DeferredObject.prototype.resolve = function (value) {

        // TypeError if value is the deferred.
        // A+ Promise Resolution Procedure 1.
        if (value === this) {

          throw new TypeError("Cannot resolve a deferred with itself.");

        }

        var x;

        if (this.resolved === true || this.failed === true) {

          return this;

        }

        // Value is a promise. Adopt the state.
        // If value is thenable but 'then' fails: fail with a reason.
        // A+ Promise Resolution Procedure 2 and 3.
        if (!!value && !!value.then && typeof value.then === "function") {

          try {

            value.then(
              defer.bind(this.resolve, this),
              defer.bind(this.fail, this)
            );

          } catch (err) {

            this.fail(err);

          }

          return this;

        }

        this.value = value;
        this.resolved = true;

        this.callbacks.reverse();
        for (x = this.callbacks.length - 1; x >= 0; x = x - 1) {

          defer(defer.bind(this.callbacks[x], null, value));

        }

        return this;

      };
      DeferredObject.prototype.ready = DeferredObject.prototype.resolve;

      // This method is used to mark the deferred as failed and
      // to execute all the failure errbacks registered. The error value
      // passed to this method is the value that will be passed to
      // all errbacks.
      //
      // This method only triggers the errbacks once after which
      // neither it nor the `resolve` method have any effect.
      DeferredObject.prototype.fail = function (value) {

        var x;

        if (this.failed === true || this.resolved === true) {

          return this;

        }

        this.failed = true;
        this.value = value;

        this.errbacks.reverse();
        for (x = this.errbacks.length - 1; x >= 0; x = x - 1) {

          defer(defer.bind(this.errbacks[x], null, value));

        }

        return this;

      };
      DeferredObject.prototype.reject = DeferredObject.prototype.fail;

      // Deferreds should never be returned directly to avoid the potential
      // of runtime manipulation. Instead, return the value of this method
      // any time that you would normally want to return the deferred.
      DeferredObject.prototype.promise = function () {

        return new PromiseObject({"deferred": this});

      };

      CollectionModule = (function () {

        var AnyCollection,
          AllCollection;

        AnyCollection = function AnyCollection() {

          var args = Array.prototype.slice.call(arguments),
            d = new DeferredObject(),
            x;

          for (x = args.length - 1; x >= 0; x = x - 1) {

            args[x].errback(defer.bind(d.fail, d));
            args[x].callback(defer.bind(d.resolve, d));

          }

          return d.promise();

        };

        AllCollection = function AllCollection() {

          var args = Array.prototype.slice.call(arguments),
            d = new DeferredObject(),
            values = [],
            x;

          function resolve(value) {

            values.push(value);

            if (values.length === args.length) {

              d.resolve(values);

            }

          }

          for (x = args.length - 1; x >= 0; x = x - 1) {

            args[x].errback(defer.bind(d.fail, d));
            args[x].callback(resolve);

          }

          return d.promise();

        };

        return {
          "All": AllCollection,
          "Any": AnyCollection
        };

      }());

      // Similar to other modules in this package, the interface returned
      // by this module is a set of wrappers around the actual objects.
      //
      // In this case deferred objects can be created in any of the following
      // ways::
      //
      //      new Deferred();
      //      Deferred();
      //      new Deferred.Deferred();
      //      Deferred.Deferred();
      //
      // The choice comes down to style and preference.
      Deferred = function () {
        return new DeferredObject();
      };
      Deferred.Deferred = Deferred;

      // Deferred.Promise exposes a secondary interface for creating promises.
      // Using the `promise` method of a deferred and creating a new promise
      // object while passing in your deferred have the same effect.
      Deferred.Promise = function (d) {
        return new PromiseObject({"deferred": d});
      };

      Deferred.Collection = CollectionModule;

      return Deferred;

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
