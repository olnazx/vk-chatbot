'use strict';

/**
 * Module dependencies.
 * @private
 */
const http = require('http');
const Router = require('./Router');
const requestHandler = require('./request-handler');

// .json, .err, .ok, .redirect
require('./Response');

class Server {
  constructor () {
    this.instance = null;
    this.router = new Router();
  }

  /**
   * Останавливает сервер.
   * @public
   */
  close () {
    if (!this.instance) {
      return;
    }

    this.instance.close();
  }

  /**
   * Запускает сервер.
   * @param {Number} port Порт
   * @public
   */
  listen (port = 3000) {
    if (this.instance) {
      return;
    }

    this.instance = http.createServer(requestHandler.bind(this));
    this.instance.listen(port);
  }

  /**
   * Определяет обработчик для маршрута.
   * @param {String} path Маршрут
   * @param {Function} func Обработчик
   * @returns {Server}
   * @public
   */
  route (path, func) {
    this.router.route(path, func);

    return this;
  }
}

module.exports = Server;
