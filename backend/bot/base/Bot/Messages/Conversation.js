'use strict';

/**
 * Module dependencies.
 * @private
 */
const Redis = require('../../../../database/redis');
const log = require('../../../../lib/logger')('bot', __filename);

/**
 * Очищает список участников беседы.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Number} chat_id ID беседы
 * @public
 */
async function clear (bot, chat_id) {
  return Redis.call('DEL', [`conversation:users:${bot.id}:${chat_id}`]);
}

/**
 * Возвращает список участников беседы.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Number} chat_id ID беседы
 * @public
 */
async function getUsers (bot, chat_id) {
  const chatUsers = await Redis.call('HGETALL', [`conversation:users:${bot.id}:${chat_id}`]);

  if (chatUsers) {
    return chatUsers;
  }

  return bot.api.call('messages.getChatUsers', {
      chat_id: chat_id,
      fields: 'first_name'
    })
    .then(response => {
      const users = chatUsersArrayToObj(response);

      if (!users) {
        return null;
      }

      const convKey = `conversation:users:${bot.id}:${chat_id}`;

      // Сохраняем полученный список участников в памяти.
      Redis.pipeline([
        ['hmset',  convKey, users],
        ['expire', convKey, 60 * 60 * 24]
      ]);

      return users;
    })
    .catch(error => {
      log.error('Unable to get chat users.', error);

      return null;
    });
}

/**
 * Преобразует массив объектов участников беседы в один объект.
 * @param {Array} usersArray
 * @returns {Object}
 * @private
 */
function chatUsersArrayToObj (usersArray = []) {
  if (!usersArray.length) {
    return null;
  }

  const output = {};

  for (let user of usersArray) {
    output[user.id] = user.first_name + ' ' + user.last_name;
  }

  return output;
}

module.exports = {
  clear,
  getUsers
}
