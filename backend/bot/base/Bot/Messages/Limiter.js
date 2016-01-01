'use strict';

/**
 * Module dependencies.
 * @private
 */
const Redis = require('../../../../database/redis');
const config = require('../../../../config');

/**
 * Проверяет, достиг ли пользователь ограничения в N сообщений в минуту.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Number} user_id ID пользователя
 * @returns {Number}
 * @public
 *
 * Status:
 *   0 - unreached
 *   1 - reached
 *   2 - exceeded
 */
async function getLimitStatus (bot, user_id) {
  const limitKey = `limit:${bot.id}:${user_id}`;
  const limit = await Redis.call('INCR', [limitKey]);

  if (!limit) {
    return 0;
  }

  // Первое сообщение за минуту.
  if (limit === 1) {
    await Redis.call('EXPIRE', [limitKey, 60]);

    return 0;
  }

  // Первое сообщение, которое вышло за рамки ограничения.
  if ((limit - 1) === config.bot.messages_per_minute) {
    await Redis.call('EXPIRE', [limitKey, config.bot.messages_lock_duration * 60]);

    return 1;
  }

  if (limit > config.bot.messages_per_minute) {
    return 2;
  } else {
    return 0;
  }
}

module.exports = {
  getLimitStatus
}
