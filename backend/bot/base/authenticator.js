'use strict';

/**
 * Module dependencies.
 * @private
 */
const VKApi = require('node-vkapi');

/**
 * Авторизует бота, используя данные из "account".
 * @param {Object} account { login: String, pass: String }
 * @returns {Promise:Object} { bot_id: Number, token: String }
 * @private
 */
async function authenticate (account) {
  const VK = new VKApi({ auth: account });

  // Авторизуем бота с максимальными разрешениями в официальном 
  // приложении ВКонтакте для Android, используя логин и пароль.
  return VK.auth.user({
      scope: 'all',
      type: 'android'
    })
    .then(tokenObject => {
      return {
        bot_id: tokenObject.user_id,
        token: tokenObject.access_token
      }
    });
}

/**
 * Авторизует ботов, перечисленных в "accounts".
 * @param {Array} accounts [{ login: String, pass: String }, ...]
 * @returns {Promise:Array}
 * @public
 */
async function authenticator (accounts) {
  return Promise.all(
    accounts.map(async account => {
      return authenticate(account);
    })
  );
}

module.exports = authenticator;
