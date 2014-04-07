=========================
Deferred.js Documentation
=========================

.. contents::

Description
===========

The Deferred.js library aims to help simplify asynchronous programming
patterns. The Deferred, or promise, can be used to represent a value that will
be available in the future.

There are quite a few implementations of deferred objects and promises in the
JavaScript community. There is even a pending ECMA standard. Until the standard
becomes final, here is a quick definition of terms as they are used in this
library:

-   Deferred

    An object that represents a future value.

-   Promise

    A read-only interface for a deferred that can safely be passed around.

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

    A specialized deferred that resolves only after one or more other deferred
    objects resolve.

It is important to note that this library is non-compliant with the Promises/A+
standard and the current ECMA draft.

Usage Examples
==============

Simple Use
----------

This examples uses jQuery to demonstrate how deferreds can help change the
pattern of async code. This module does not require jQuery. It is simply used
for demonstration::

    function ajax(url) {

        var deferred = new Deferred();

        $.ajax({
            url: url,
            success: function (data) {

                deferred.resolve(data);

            },
            error: function (jqxhr, status, err) {
                deferred.fail(err);
            }

        });

        return deferred.promise();

    }

    var resultPromise = ajax("mysite.com");

    resultPromise.callback(function (value) {
        console.log(value);
    });

    resultPromise.errback(function (err) {
        console.log(err);
    });

Using A Collection
------------------

Continuing with the above example, let's say now we need to grab data from
multiple endpoints and then do something. This is a good case for an `All`
collection::

    var collection = Deferred.Collection.All(
        // Note: The constructor consumes promises.
        ajax("site1"),
        ajax("site2"),
        ajax("site3")
    );

    collection.callback(function (values) {
        // Iterate over all the values and do something.
    });
    collection.errback(function (reason) {
        // Called if any of the promises fail.
    });

There is also an `Any` collection which resolves as soon as any one of the
given promises resolved rather than waiting for all promises to resolve.

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

In a browser environment, the Deferred library will load in the global
`deferredjs`::

    typeof deferredjs.Deferred === "function"; // true

    typeof deferredjs.Promise === "function"; // true

    typeof deferredjs.Collection.All === "function"; // true

    typeof deferredjs.Collection.Any === "function"; // true

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
