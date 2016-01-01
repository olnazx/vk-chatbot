'use strict';

/**
 * Module dependencies.
 * @private
 */
const accounts = require('../../config/accounts');
const log = require('../../lib/logger')('bot', __filename);

/**
 * В беседу пригласили пользователя.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Object} message Объект сообщения
 * @public
 */
async function handler (bot, message) {
  // В беседу был приглашён ещё один наш бот.
  // Старый бот выходит, новый остаётся.
  if (Object.keys(accounts).includes(message.attachments.source_mid)) {
    return bot.api.call('messages.removeChatUser', {
        chat_id: message.conversation_id,
        user_id: bot.id
      })
      .then(() => null)
      .catch(error => {
        log.error('Unable to leave chat with more than one our bot in it.', error);

        return;
      });
  }

  return;
}

module.exports = handler;
