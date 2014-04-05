===========
Deferred.js
===========

**Cross platform deferred objects with event support.**

.. image:: https://travis-ci.org/kevinconway/Deferred.js.png?branch=master
    :target: https://travis-ci.org/kevinconway/Deferred.js
    :alt: Current Build Status

What Is Deferred?
=================

Deferred is a non-compliant implementation of the Promise interface.

The Deferred.js library is a Modelo mix-in object that can be used to help
simplify asynchronous programming patterns. The Deferred, and the limited
promise interface that it generates, can be used to represent a value that will
be available in the future.

There are many different implementations and APIs for Deferred objects and
promises. In this library a Deferred represents a *single* value, or resource,
that will be available at some point in the future. All callbacks registered
with a Deferred are called with the same value just as all errbacks registered
are called with the same error. Callbacks and errbacks are not guaranteed to
execute in any particular order.

Show Me
=======

::

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

    // Now multiple callbacks can be added without nesting.

    var resultPromise = getRemoteData();

    resultPromise.callback(function (value) {
        console.log(value);
    });

    resultPromise.errback(function (err) {
        console.log(err);
    });

    // At some point later:
    // Console Outputs the contents of either `value` or `err`

For more detailed usage guides and API specifications, see the docs directory.

Setup
=====

Node.js
-------

This package is published through NPM under the name `deferredjs`::

    $ npm install deferredjs

Once installed, simply `Deferred = require("deferredjs")`.

Browser
-------

Developers working with a normal browser environment can use regular script
tags to load the package. This package has dependencies on these other
packages:

-   `Modelo <https://github.com/kevinconway/Modelo.js>`_

-   `Defer <https://github.com/kevinconway/Defer.js>`_

-   `Event <https://github.com/kevinconway/Event.js>`_

The load order should be something like this::

    <script src="modelo.js"></script>
    <script src="defer.js"></script>
    <script src="event.js"></script>
    <script src="deferred.js"></script>

The package loads into a global variable named `deferredjs`.

Tests
-----

To run the tests in Node.js use the `npm test` command.

To run the tests in a browser, run the `install_libs` script in the test
directory and then open the `runner.html` in the browser of your choice.

License
=======

Deferred
--------

This project is released and distributed under an MIT License.

::

    Copyright (C) 2013 Kevin Conway

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.

Contributors
============

Style Guide
-----------

All code must validate against JSlint.

Testing
-------

Mocha plus expect. All tests and functionality must run in Node.js and the
browser.

Contributor's Agreement
-----------------------

All contribution to this project are protected by the contributors agreement
detailed in the CONTRIBUTING file. All contributors should read the file before
contributing, but as a summary::

    You give us the rights to distribute your code and we promise to maintain
    an open source release of anything you contribute.
