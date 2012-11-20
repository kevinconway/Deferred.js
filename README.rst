===========
Deferred.js
===========

**Deferred objects with event support.**

*Status: In Development*

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

Setup Instructions
==================

This library is designed from the beginning to operate in as many JavaScript
environments as possible. To accomplish this, all modules have been wrapped in
a specialized module pattern that will detect the current environment and
choose the most appropriate loading mechanism.

Currently support platforms are Node.js, browser via <script>, and AMD via
RequireJS.

Node.js
-------

This package can be loaded using `require()` just like any other in Node.js.

Browser (<script>)
------------------

Developers working with a normal browser environment can use regular script
tags to load the package. Deferred loads into a global `Deferred` function.

    <script src="deferred.js"></script>

Browser (AMD)
-------------

Developers working with an AMD loader like RequireJS can add Deferred as though
it were normal dependencies.

License
=======

Deferred
--------

This project is released and distributed under an MIT License.

::

    Copyright (C) 2012 Kevin Conway

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.

Mocha and Expect
----------------

Mocha and Expect are included with this repository for convenience. Both
libraries are distributed by their original authors under the MIT license.
Each library contains the full license text and original copyright notice.

Contributors
============

Style Guide
-----------

This library needs to be not only cross-platform compatible but also backwards
compatible as much as possible when it comes to browser environments. For this
reason, all code in this repository must validate with JSLint.

Testing
-------

Test coverage is essential to backing up the claim that this library is
compatible across all JavaScript environments. Unit tests are this repository's
guarantee that all components function as advertised in the environment. For
this reason, all code this repository must be tested using the chosen unit
testing library: Mocha.js. The chosen assertion library to use with Mocha
for this project is Expect.js. Mocha and Expect have been chosen for their
cross-platform compatibility.

For convenience and portability, both Mocha and Express are included in this
repository. For further convenience, browser based test runners have also been
included for both <script> and AMD loading.

Commit Messages
---------------

All commit messages in this repository should conform with the commit message
pattern detailed in
`this document <https://github.com/StandardsDriven/Repository>`_.

Contributor's Agreement
-----------------------

All contribution to this project are protected by the contributors agreement
detailed in the CONTRIBUTING file. All contributors should read the file before
contributing, but as a summary::

    You give us the rights to distribute your code and we promise to maintain
    an open source release of anything you contribute.
