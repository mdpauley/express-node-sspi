Expressjs NodeSSPI Middleware
========

Simple middleware to use [node-sspi](https://github.com/abbr/NodeSSPI) quickly with [Expressjs](https://expressjs.com/).

## Install
```shell
npm install express-node-sspi
```

## Usages
### Overview

```javascript
'use strict'

var express = require('express')
var app = express()
var server = require('http').createServer(app)
var nodeSSPI = require('express-node-sspi');

app.use(nodeSSPI({
  retrieveGroups: true
}));

app.use(function(req, res, next) {
  var out =
    'Hello ' +
    req.connection.user +
    '! Your sid is ' +
    req.connection.userSid +
    ' and you belong to following groups:<br/><ul>'
  if (req.connection.userGroups) {
    for (var i in req.connection.userGroups) {
      out += '<li>' + req.connection.userGroups[i] + '</li><br/>\n'
    }
  }
  out += '</ul>'
  res.send(out)
})
// Start server
var port = process.env.PORT || 3000
server.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'))
})
```

### Inputs

The call to `new nodeSSPI(opts)` in above code can take following options:
  * offerSSPI: true|false 
      - default to *true*. Whether to offer SSPI Windows authentication
  * offerBasic: true|false 
      - default to *true*. Whether to offer Basic authentication
  * authoritative: true|false 
      -  default to *true*. Whether authentication performed by NodeSSPI is authoritative. If set to *true*, then requests passed to downstream are guaranteed to be authenticated because non-authenticated requests will be blocked. If set to *false*, there is no such guarantee and downstream middleware have the chance to override outputs from NodeSSPI and impose their own rules.
  * perRequestAuth: false|true 
      - default to *false*. Whether authentication should be performed at per request level or per connection level. Per connection level is preferred to reduce overhead.
  * retrieveGroups: false|true 
      - default to *false* for performance sake. Whether to retrieve groups upon successful authentication. See [caveats](#caveats) below.
  * maxLoginAttemptsPerConnection: &lt;number&gt;
      - default to *3*. How many login attempts are permitted for this connection.
  * sspiPackagesUsed: &lt;array&gt;
      - default to *['NTLM']*. An array of SSPI packages used. To obtain a list of all SSPI packages available on your server, download source code of [mod-auth-sspi](https://code.google.com/p/mod-auth-sspi/source/checkout), then run *bin\sspikgs.exe* from your server's DOS console. 
  * domain: &lt;string&gt;
      - no default value. This is the domain name (a.k.a realm) used by basic authentication if user doesn't prefix their login name with *&lt;domain_name&gt;\\*. 

### Outputs
  * upon successful authentication
    * authenticated user name is populated into field `req.connection.user`
    * authenticated user sid is populated into field `req.connection.userSid` 
    * if option `retrieveGroups` is *true*, group names are populated into field `req.connection.userGroups` as an array.
  * otherwise
    * if option `authoritative` is set to *true*, then the request will be blocked. The reason of blocking (i.e. error message) is written to response body as well as the *err* parameter of the callback function. Some response headers such as *WWW-Authenticate* may get filled out, and one of following HTTP response codes will be populated to field `res.statusCode`:
      * 403 if max login attempts are reached
      * 401 for all in-progress authentications, including protocols that require multiple round trips or if max login attempts has not been reached.
      * 500 when NodeSSPI encountered exception it cannot handle.
    * if option `authoritative` is not set to *true*, then the output is the same as authoritative except NodeSSPI will not write error message to response body, nor block the request, i.e. it will not call `res.end(err)`. This allows the caller and downstream middleware to make decision.

## License

The MIT License (MIT)

Copyright (c) 2014-present, @abbr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
