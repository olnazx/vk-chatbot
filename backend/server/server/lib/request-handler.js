'use strict';

/**
 * Module dependencies.
 * @private
 */
const querystring = require('querystring');

/**
 * Обработчик всех входящих запросов.
 * @param {Request} request http.IncomingMessage
 * @param {Response} response http.ServerResponse
 * @public
 *
 * this #Server (./Server.js)
 */
function handleRequest (request, response) {
  let url = request.url;
  const signIndex = url.indexOf('?', 1);

  request.query = Object.create(null);

  // Парсим querystring.
  if (~signIndex) {
    request.query = querystring.parse(url.slice(signIndex + 1));
    url = url.slice(0, signIndex);
  }

  // Удаляем слэши в конце строки URL.
  if (url.length > 1 && url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  const routeHandler = this.router.resolve(url);

  // Нет обработчика для этого маршрута.
  if (!routeHandler) {
    response.writeHead(404);
    response.end();

    return;
  }

  routeHandler(request, response);
}

module.exports = handleRequest;
