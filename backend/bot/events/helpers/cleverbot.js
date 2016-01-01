'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');
const xml2js = require('xml2js');

/**
 * Local constants.
 * @private
 */
const REQUEST_URL = 'http://cleverbot.existor.com/webservicexml';
const REQUEST_URL_AU = 'http://cleverbot.existor.com/webservicexml_ais_';

/**
 * Парсит ответ Cleverbot.
 * @param {String} response XML-документ
 * @returns {Promise:Object} { response, state }
 * @private
 */
async function parseResponse (response) {
  if (response && !response.length) {
    throw new Error('"response" is empty.');
  }

  return new Promise((resolve, reject) => {
    xml2js.parseString(response, (err, res) => {
      if (err) {
        return reject(err);
      }

      let rootObj = res.webservicexml.session[0];
      let resultTxt = '';
      let resultObj = {};

      for (let i = 0, keys = Object.keys(rootObj), len = keys.length; i < len; i++) {
        resultObj[keys[i]] = rootObj[keys[i]][0];
      }

      resultTxt = resultObj.response;

      delete resultObj.response;

      resolve({
        response: resultTxt,
        state: resultObj
      });
    });
  });
}

/**
 * Шифрует параметры запроса.
 * @param {Object} params Параметры запроса
 * @returns {String}
 * @private
 */
function encodeParams (params) {
  let output = [];

  for (let x in params) {
    output.push(x + "=" + encodeURIComponent(params[x]));
  }

  return output.join("&");
}

/**
 * Send function.
 * @param  {Object} {
 *   @prop {Object} user {
 *     @prop {String} username
 *     @prop {String} password
 *   }
 *   @prop {Object} message {
 *     @prop {String} text
 *     @prop {Object} state
 *   }
 * }
 * @returns {Object}
 * @public
 */
async function send ({ user = {}, message = {} }) {
  let requestUrl = REQUEST_URL;
  let requestParams = {};

  if (!user.username || !user.password) {
    throw new Error('"user" is required.');
  }

  if (!message || !message.text) {
    throw new Error('"message.text" can not be empty.');
  }

  requestParams['icognoID'] = user.username;
  requestParams['icognoCheck'] = user.password;
  requestParams['isLearning'] = '0';
  requestParams['stimulus'] = message.text;

  if (message.state) {
    requestUrl = REQUEST_URL_AU + message.state.rpsais;
    requestParams = Object.assign(requestParams, message.state);
  }

  return prequest.post({
      url: requestUrl,
      body: encodeParams(requestParams)
    })
    .then(response => parseResponse(response));
}

module.exports = {
  send
}
