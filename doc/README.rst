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

        var deferred = new deferredjs.Deferred();

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
methods if the desire is to simply add multiple callbacks/errbacks when the
value is ready. This pattern is not recommended:

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

It is important to note that the 'callback' and 'errback' methods do not
return a thenable.

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

    var thenableTrue = deferredjs.thenable.when(returnTrue());
    thenableTrue().then(function (value) { console.log(value); }); // true.

This wrapper resolves to a no-op if the function you wrap already produces
a thenable.

API Reference
=============

Exports
-------

Node.js::

    var Deferred = require('deferredjs').Deferred;
    var when = require('deferredjs').when;

    var thenable = require('deferredjs').thenable;
    var Thenable = thenable.Thenable;
    var isNativeThenable = thenable.isNativeThenable;
    var isThenable = thenable.isThenable;

    var collection = require('deferredjs').collection;
    var All = collection.All;
    var Any = collection.Any;

    var locks = require('deferredjs').locks;
    var runOnce = locks.runOnce;
    var runOne = locks.runOne;

    var base = require('deferredjs').base;
    var Resolvable = base.Resolvable;
    var Rejectable = base.Rejectable;
    var SingleUseCallbackAggregator = base.SingleUseCallbackAggregator;
    var CallbackAggregator = base.CallbackAggregator;

In a browser environment, the Deferred library will load in the global
`deferredjs`.

CallbackAggregator
------------------

Object which manages the aggregation and execution of callbacks. The
constructor takes no arguments.

add(fn)
^^^^^^^

Place a function on the callback queue. Raises TypeError if not a function.

execute(...)
^^^^^^^^^^^^

Execute all callbacks in order. All arguments given are passed into each
callback. All callbacks are executed asynchronously.

SingleUseCallbackAggregator
---------------------------

Extension of CallbackAggregator which only executes once. The constructor
takes no arguments.

add(fn)
^^^^^^^

Raises TypeError if input is not a function.

Place a function on the callback queue if execute has not run yet. Otherwise
immediately defer the function for asynchronous execution.

execute(...)
^^^^^^^^^^^^

Execute all callbacks in order. All arguments given are passed into each
callback. All callbacks are executed asynchronously. This only works once. All
subsequent calls are no-ops.

Resolvable
----------

Object containing a SingleUseCallbackAggregator which can be resolved with a
single value. That value it used in the callback execute calls. The constructor
takes no arguments

callback(fn)
^^^^^^^^^^^^

Add a callback to the queue. Raises TypeError if input is not a function.

complete()
^^^^^^^^^^

Return true or false based on whether or not the object has processed the
callbacks.

resolve(value)
^^^^^^^^^^^^^^

Execute all the callbacks with the given value.

Rejectable
----------

Object containing a SingleUseCallbackAggregator which can be resolved with a
single value. That value it used in the errbacks execute calls. The constructor
takes no arguments

errback(fn)
^^^^^^^^^^^^

Add an errback to the queue. Raises TypeError if input is not a function.

complete()
^^^^^^^^^^

Return true or false based on whether or not the object has processed the
errbacks.

reject(reason)
^^^^^^^^^^^^^^

Execute all the errbacks with the given reason.

runOnce(fn)
-----------

Returns a wrapped version of 'fn' which only runs once. All subsequent calls
are ignored.

runOne()
--------

Return a function wrapper which can be applied to any number of functions.
The wrapper ensures that only one of the functions wrapped will be run. All
subsequent calls to all functions, including the one that executed, are
ignored.

when(value)
-----------

If value is a thenable this function resolves to a no-op. If the value is not
a thenable it returns a thenable which is already resolved with the given
value.

isNativeThenable(thenable)
--------------------------

Returns true or false based on whether or not the given thenable is an instance
of the Thenable object.

isThenable(thenable)
--------------------

If the object given is not a thenable the value 'false' is returned. Otherwise
the return value is a bound version of the 'then' method from the thenable.

Thenable
--------

A basic deferred object which represent a future value.

complete()
^^^^^^^^^^

Return true or false based on whether or not the object has been resolved or
rejected.

then(onResolve, onReject)
^^^^^^^^^^^^^^^^^^^^^^^^^

A+ compliant 'then' method. Returns a Thenable.

resolve(value)
^^^^^^^^^^^^^^

Resolves the Thenable using the A+ promise resolution logic.

reject(reason)
^^^^^^^^^^^^^^

Rejects the Thenable.

Deferred
--------

Extension of the Thenable object. Can generate promises.

promise()
^^^^^^^^^

Generate a limited interface for the deferred that cannot be resolved or
rejected.

Promise
-------

Extension of the Thenable object and limited interface for a deferred.

isFrom(deferred)
^^^^^^^^^^^^^^^^

Return true or false depending on whether or not the given deferred generated
the promise.
