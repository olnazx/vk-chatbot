'use strict';

/**
 * Module dependencies.
 * @private
 */
const http = require('http');

// response.json()
http.ServerResponse.prototype.json = function json (data) {
  if (!this.headersSent) {
    this.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8'
    });
  }

  this.end(JSON.stringify(data));
}

// response.redirect()
http.ServerResponse.prototype.redirect = function redirect (url, code) {
  if (!this.headersSent) {
    this.writeHead(code || 302, {
      'Location': url
    });
  }

  this.end();
}

// response.err()
http.ServerResponse.prototype.err = function err (cause) {
  this.json({
    ok: false,
    cause
  });
}

// response.ok()
http.ServerResponse.prototype.ok = function ok (response) {
  this.json({
    ok: true,
    response
  });
}
