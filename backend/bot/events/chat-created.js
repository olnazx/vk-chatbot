'use strict';

/**
 * Module dependencies.
 * @private
 */
const Conversation = require('../base/Bot/Messages/Conversation');
const log = require('../../lib/logger')('bot', __filename);
const accounts = require('../../config/accounts');

/**
 * Беседа только что создана вместе с ботом.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Object} message Объект сообщения
 * @public
 */
async function handler (bot, message) {
  const chatUsers = await Conversation.getUsers(bot, message.conversation_id);

  if (!chatUsers) {
    return;
  }

  const userIds = Object.keys(chatUsers);
  const botIds = Object.keys(accounts);

  let matchesCount = 0;

  for (let botId of botIds) {
    if (userIds.includes(botId)) {
      matchesCount++;
    }

    if (matchesCount > 1) {
      break;
    }
  }

  if (matchesCount > 1) {
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

  return {
    message: 'Привет!\n\n' + 
             'Я -- чат-бот от паблика <<Чат-боты>> (vk.com/botsforchats).\n' + 
             'Умею общаться и выполнять команды.\n\n' + 
             'Чтобы получить помощь, напишите в чат <</помощь>> (или <</help>>).',
    forward: false
  }
}

module.exports = handler;
