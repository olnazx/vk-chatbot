'use strict';

/**
 * Module dependencies.
 * @private
 */
const commandHandler = require('./command');
const cleverbot = require('./helpers/cleverbot');
const log = require('../../lib/logger')('bot', __filename);
const config = require('../../config');

/**
 * Обращение к боту.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Object} message Объект сообщения
 * @public
 */
async function handler (bot, message) {
  let mess = message.message;

  if (message.is_multichat) {
    // Для сообщений в беседах удаляем из текста обращение к боту.
    mess = mess.replace(/^[^\s,]+[\s,]+/, '').trim();

    /**
     * Попытаемся выполнить команду, вызванную в "разговорной форме".
     * Например:
     * >> "Бот, когда ответишь?"
     * "когда" здесь - команда "/when" (./commands/when.js).
     */

    const messageToProcess = Object.assign({}, message);
          messageToProcess.message = '/' + mess;

    const commandHandlerResult = await commandHandler(bot, messageToProcess);

    if (commandHandlerResult) {
      return commandHandlerResult;
    }
  }

  // Сообщение не содержит ни одного русского символа. Ничего отвечать не будем.
  if (!/[а-яё]/ig.test(mess)) {
    return;
  }

  // @todo
  // return;

  // Получаем ответ на сообщение от cleverbot.
  return cleverbot.send({
      user: config.api.cleverbot,
      message: {
        text: mess.slice(0, 250)
      }
    })
    .then(response => {
      let reply = response.response;

      // Не пришло внятного ответа. Или от cleverbot.com пришло рекламное сообщение.
      if (!reply || /(?:botlike|clever|real person)/.test(reply.toLowerCase())) {
        log.info('Unable to get sane answer from cleverbot.com.');

        return;
      }

      // Ответ пришёл и он нормальный.
      // Удаляем точку в конце предложения, ибо cleverbot любит 
      // ставить точки даже в конце вопросительных предложений.
      if (reply.endsWith('.')) {
        reply = reply.slice(0, -1);
      }

      return {
        message: reply,
        replace_urls: true
      }
    })
    .catch(error => {
      log.error('Unable to get response from cleverbot.com', error);

      return;
    });
}

module.exports = handler;
