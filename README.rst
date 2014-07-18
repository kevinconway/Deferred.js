===========
Deferred.js
===========

**Cross platform, A+ compliant promises.**

.. image:: https://travis-ci.org/kevinconway/Deferred.js.png?branch=master
    :target: https://travis-ci.org/kevinconway/Deferred.js
    :alt: Current Build Status

What Is Deferred?
=================

A deferred is an object that represents a future value. Its purpose is to help
simplify async programming patterns.

This package contains an implementation of the
`Promises/A+ specification <https://github.com/promises-aplus/promises-spec>`_.

For the purposes of this library, a deferred is an A+ compliant thenable
that represents a future value. A promise is an interface to a deferred that
prevents accidental resolution or rejection.

Show Me
=======

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

This module uses browserify to create a browser compatible module. The default
grunt workflow for this project will generate both a full and minified browser
script in a build directory which can be included as a <script> tag::

    <script src="deferred.browser.min.js"></script>

The package is exposed via the global name `deferredjs`.

Tests
-----

Running the `npm test` command will kick off the default grunt workflow. This
will lint using jslint, run the mocha/expect tests, generate a browser module,
and test the browser module using PhantomJS.

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
