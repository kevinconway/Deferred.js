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

-   Resolve

    Marking a deferred as complete with a successful value.

-   Reject

    Marking a deferred as complete with a failure reason.

-   Callback

    A function to run after a deferred is resolved. It is run with the deferred
    value as the first argument.

-   Errback

    A function to run after a deferred is failed. It is run with the failure
    reason as the first argument.

-   Collection

    A specialized promise that resolves only after one or more other thenable
    objects resolve.

Usage Examples
==============

Simple Use
----------

Each call to 'then' produces a new promise. This can be used to create async
task chains.

.. code-block:: javascript

    function ajax(endpoint) {
        var d = new deferredjs.Deferred();
        // Do async ajax stuff and call d.resolve with the response.
        return d.promise();
    }

    ajax('api.somesite.com').then(saveToDb).then(printToUser, handleError);

Callback/Errback Aggregation
----------------------------

Both parameters for the 'then' method are optional. If either the callback or
errback parameter is not needed, however, you can use the 'callback' and
'errback' helpers.

.. code-block:: javascript

    var p = ajax('api.somesite.com').callback(saveToDb).callback(print)
    p = p.errback(handleAllErrors);

Using A Collection
------------------

Continuing with the above example, let's say now we need to grab data from
multiple endpoints and then do something. Rather than grab data from each
endpoint as the previous one completes (then chaining) we want to start all of
these operations concurrently. This is a good case for an `All` collection:

.. code-block:: javascript

    var collection = deferredjs.collection.All(
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
programming patterns created by, and play nicely with, thenables use the 'when'
converter function to wrap them:

.. code-block:: javascript

    function returnTrue() {
        return true;
    }

    var thenableTrue = deferredjs.when(returnTrue());
    thenableTrue().then(function (value) { console.log(value); }); // true.

If the value is already thenable it is converted into a promise from this
library.

API Reference
=============

Exports
-------

Node.js::

    var Deferred = require('deferredjs').Deferred;
    var when = require('deferredjs').when;

    var collection = require('deferredjs').collection;
    var All = collection.All;
    var Any = collection.Any;

In a browser environment, the Deferred library will load in the global
`deferredjs`.

when(value)
-----------

If the value is not thenable it returns a thenable which is already resolved
with the given value. If the value is already thenable it is converted into a
promise from this library.

Deferred
--------

An A+ compliant thenable.

then(onResolve, onReject)
^^^^^^^^^^^^^^^^^^^^^^^^^

Produce a new promise that is resolved or rejected based on the behaviour of
onResolve and onReject.

callback(onResolve)
^^^^^^^^^^^^^^^^^^^

Executes 'then' without a second argument.

errback(onReject)
^^^^^^^^^^^^^^^^^

Executes 'then' without a first argument.

promise()
^^^^^^^^^

Generate a limited interface for the deferred that cannot be resolved or
rejected.

Promise
-------

An interface for a deferred that does not contain the reject or resolve
methods. All other methods of Deferred are exposed.

isFrom(deferred)
^^^^^^^^^^^^^^^^

Return true or false depending on whether or not the given deferred generated
the promise.
