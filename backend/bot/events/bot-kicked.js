'use strict';

/**
 * Module dependencies.
 * @private
 */
const Conversation = require('../base/Bot/Messages/Conversation');

/**
 * Бота кикнули из беседы.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Object} message Объект сообщения
 * @public
 */
async function handler (bot, message) {
  // Удаляем сообщения из очереди для этой беседы.
  bot.queue.clearById(message.conversation_id);

  // Удаляем список участников этой беседы из памяти.
  Conversation.clear(bot, message.conversation_id);

  return;
}

module.exports = handler;
