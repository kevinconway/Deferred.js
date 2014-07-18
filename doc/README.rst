=========================
Deferred.js Documentation
=========================

.. contents::

Description
===========

The Deferred.js library aims to help simplify asynchronous programming
patterns. The Deferred, or promise, can be used to represent a value that will
be available in the future.

This package complies with the Promises/A+ specification. However, these docs
may use terminology differently or terms that do not appear in that
specification. Here is how the terms will be used in this document:

-   Thenable

    And object with a 'then' method which complies with the A+ specification.

-   Deferred

    A thenable which represents a future value. Can be resolved with a value
    or rejected with a reason.

-   Promise

    An interface for a deferred which is also a thenable but does not provide
    access to the resolve and reject methods. This makes a promise a safe
    alternative to return from a function rather than a raw deferred.

-   Resolve, Ready

    Marking a deferred as complete with a successful value.

-   Fail, Reject

    Marking a deferred as complete with a failure reason.

-   Callback

    A function to run after a deferred is resolved. It is run with the deferred
    value as the first argument.

-   Errback

    A function to run after a deferred is failed. It is run with the failure
    reason as the first argument.

-   Collection

    A specialized promise that resolves only after one or more other deferred
    objects resolve.

Usage Examples
==============

Simple Use
----------

This examples uses jQuery to demonstrate how deferreds can help change the
pattern of async code. This module does not require jQuery. It is simply used
for demonstration:

.. code-block:: javascript

    // Wrap async operations in functions that return a deferred.
    function getRemoteData() {

        var deferred = new Deferred();

        // Note: jQuery is not required and only used here for demonstration.
        $.ajax({
            url: "myDataServer.com",
            success: function (data) {

                deferred.resolve(data);

            },
            error: function (jqxhr, status, err) {
                deferred.fail(err);
            }

        });

        return deferred.promise();

    }

    var resultPromise = getRemoteData();

    // Each call to "then" produces a new promise that is resolved when the
    // given handlers are executed. This makes it possible to create an async
    // workflow without deeply nesting callbacks.
    resultPromise.then(function (value) {
        console.log("Got the data.");
        console.log(value);
        return someOtherAsyncFunction(value);
    }).then(function (value) {
        console.log("Got the result of someOtherAsyncFunction.")
        console.log(value);
    }, function (err) {
        console.log("Something went wrong.");
        console.log(err);
    });

Callback/Errback Aggregation
----------------------------

The 'then' method can be called on a promise any number of times to continue
adding addition callbacks or errbacks to be triggered. 'then' is all you really
need. If preferred, however, you can choose to use the 'callback' and 'errback'
methods the desire is to simply add multiple callbacks/errbacks when the value
is ready. This pattern is not recommended:

.. code-block:: javascript

    // Alternatively, handlers can simply be added to a single promise if they
    // require no chaining.
    resultPromise.callback(function (value) {
        console.log("One off success handler.");
        console.log("Text appears after 'Got the data' from above.")
    });
    resultPromise.errback(function (err) {
        console.log("One off rejection handler.");
        console.log("Text appears after 'Something went wrong' from above.")
    });

It is important to note that the 'callback' and 'errback' methods do not return
thenables.

Using A Collection
------------------

Continuing with the above example, let's say now we need to grab data from
multiple endpoints and then do something. Rather than grab data from each
endpoint as the previous one completes (then chaining) we want to start all of
these operations concurrently. This is a good case for an `All` collection:

.. code-block:: javascript

    var collection = Deferred.Collection.All(
        // Note: The constructor consumes promises.
        ajax("site1"),
        ajax("site2"),
        ajax("site3")
    );

    collection.then(function (values) {
        // Iterate over all the values and do something.
    }, function (reason) {
        // Called if any of the promises fail.
    });

There is also an `Any` collection which resolves as soon as any one of the
given promises resolves rather than waiting for all promises to resolve.

Wrapping Synchronous Code
-------------------------

Not everything involved in a project is going to be asynchronous and produce
thenables. This is particularly true when working with third party libraries.
In the event that you need to run synchronous code but want it to tie into the
programming patterns created by, and play nicely with, thenables use the given
converter function to wrap them:

.. code-block:: javascript

    function returnTrue() {
        return true;
    }

    var thenableTrue = Deferred.convert(returnTrue);
    thenableTrue().then(function (value) { console.log(value); }); // true.

This wrapper resolves to a no-op if the function you wrap already produces
a thenable.

API Reference
=============

Exports
-------

Node.js::

    var Deferred = require('deferredjs').Deferred;

    typeof Deferred === "function"; // true

    var Promise = require('deferredjs').Promise;

    typeof Promise === "function"; // true

    var Collection = require('deferredjs').Collection;

    typeof Collection.All === "function"; // true

    typeof Collection.Any === "function"; // true

    var convert = require('deferredjs').convert;

    typeof convert === "function"; // true

In a browser environment, the Deferred library will load in the global
`deferredjs`::

    typeof deferredjs.Deferred === "function"; // true

    typeof deferredjs.Promise === "function"; // true

    typeof deferredjs.Collection.All === "function"; // true

    typeof deferredjs.Collection.Any === "function"; // true

    typeof deferredjs.convert === "function"; // true

Deferred
--------

The constructor does not require arguments.

callback(fn)
^^^^^^^^^^^^

*Aliases: success, done*

Registers a callback function to be executed upon resolution of this Deferred.
Functions registered with `callback` will be passed the value of the Deferred
as an argument when called. Functions registered after the Deferred has already
been resolved will be automatically executed with the appropriate value.

All callbacks are launched asynchronously.

errback(fn)
^^^^^^^^^^^

*Aliases: failure, error*

Registers an errback function to be executed upon failure of this Deferred.
Functions registered with `errback` will be passed the value of the error
as an argument when called. Functions registered after the Deferred has already
been failed will be automatically executed.

All errbacks are launched asynchronously.

then(callback, errback)
^^^^^^^^^^^^^^^^^^^^^^^

An A+ compliant `then` method. Accepts a callback and an errback to run when
the deferred is resolved/failed. The return value is a new promise which
follows the A+ resolution logic. Both arguments are optional.

resolve(value)
^^^^^^^^^^^^^^

*Aliases: ready*

Triggers the execution of the callback functions with the given value. This
marks the Deferred as complete and can only be called once.

fail(value)
^^^^^^^^^^^

*Aliases: reject*

Triggers the execution of errback functions with the given value. This marks
the Deferred as complete and can only be called once.

promise()
^^^^^^^^^

Generates a read-only interface to this Deferred. Returned value will be an
instance of a Promise object.

Promise
-------

Constructor accepts a deferred as an argument.

Promises provide a read-only interface to the underlying deferred. Callbacks
and errbacks may be registered, but the `resolve` and `fail` methods are
not exposed. This makes the promise safe to return from an async method and
into the control of other functions.

Deferred methods exposed by the promise interface:

-   callback (success, done)

-   errback (failure, error)

-   then

Collection.All
--------------

Constructor accepts a list of promises. Produces a promise that resolves when
all underlying promises are resolved. All promise methods are supported.

This promise resolved with a list of all promise values or fails with the first
exception thrown. If resolved, the order of the values will match the order in
which their respective promises resolved.

Collection.Any
--------------

Constructor accepts a list of promises. Produces a promise that resolves as
soon as any one of the underlying promises resolves.

This promise resolves with the value of the underlying promise that resolves
it.

convert(fn)
-----------

This function wraps any given function to always produce a thenable. If the
given function already produces a thenable it resolves to a no-op. If the given
function return a value then the wrapped version will return a promise that
is already resolved to that value. If the given function throws an error then
the wrapped version will return a promise that is already rejected with that
reason.
