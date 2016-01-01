'use strict';

/**
 * Module dependencies.
 * @private
 */
const server = require('./server')();
const config = require('../config');

[
  '/api/v1/captcha.getAll',
  '/api/v1/captcha.image',
  '/api/v1/captcha.send'
].forEach(path => server.route(path, require('./routes' + path)));

server.listen(config.www.port);
