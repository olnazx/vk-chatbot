'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');

/**
 * Обработчик запроса.
 * @param {Request} request http.IncomingMessage
 * @param {Response} response http.ServerResponse
 * @public
 */
function handler (request, response) {
  const sid = request.query.sid;

  if (!sid) {
    return response.err('"sid" is undefined.');
  }

  return prequest('https://api.vk.com/captcha.php?sid=' + sid + '&s=1').pipe(response);
}

module.exports = handler;
