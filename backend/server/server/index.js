'use strict';

/**
 * Module dependencies.
 * @private
 */
const Server = require('./lib/Server');

/**
 * Возвращает экземпляр "Server".
 * @return {Object}
 * @public
 */
function createServer () {
  return new Server();
}

module.exports = createServer;
