'use strict';

/**
 * Module dependencies.
 * @private
 */
const crypto = require('crypto');
const Redis = require('../../../../database/redis');
const config = require('../../../../config');

/**
 * Обработчик запроса.
 * @param {Request} request http.IncomingMessage
 * @param {Response} response http.ServerResponse
 * @public
 *
 * @response void
 */
async function handler (request, response) {
  const {
    auth_key,
    captcha_bot_id,
    captcha_sid,
    captcha_key,
    user_id
  } = request.query;

  if (
    !auth_key ||
    !captcha_bot_id ||
    !captcha_sid ||
    !captcha_key ||
    !user_id
  ) {
    return response.err('Missed param.');
  }

  const md5hash = crypto
                  .createHash('md5')
                  .update(config.vk_group_app.id + '_' + user_id + '_' + config.vk_group_app.secret)
                  .digest('hex');

  if (md5hash !== auth_key) {
    return response.err('Access denied.');
  }

  // bot/base/Bot/Captcha.js
  await Redis.pipeline([
    ['srem', 'captcha:' + captcha_bot_id, captcha_sid],
    ['publish', `captcha:recognized:${captcha_bot_id}:${captcha_sid}`, captcha_key]
  ]);

  response.ok();
}

module.exports = handler;
