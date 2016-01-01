'use strict';

/**
 * Module dependencies.
 * @private
 */
const EventEmitter = require('events');
const prequest = require('request-promise');
const log = require('../../../../../lib/logger')('bot', __filename);

/**
 * Local constants.
 * @private
 */
const HTML_ENTITIES = [['&lt;', '<'], ['&gt;', '>'], ['&amp;', '&'], ['&quot;', '"'], ['<br>', '. ']];

const emitter = new EventEmitter();

/**
 * Отправляет LongPoll запрос.
 * @param {Bot} bot Экземпляр "Bot"
 * @param {String} link LongPoll Server URL
 * @returns {Promise}
 * @public
 */
function makeARequest (bot, link = '') {
  log.info(`[id${bot.id}] LongPoll request was sent.`);

  if (!link) {
    return bot.api.call('messages.getLongPollServer')
      .then(response => {
        return makeARequest(
          bot,
          `https://${response.server}?act=a_check&wait=25&mode=2&key=${response.key}&ts=${response.ts}`
        );
      })
      .catch(error => {
        // Не пишем в лог серверные ошибки ВКонтакте.
        if (!(error.name === 'VKApiError' && error.code === 10)) {
          log.error('Unable to get LongPoll server info.', error);
        }

        return makeARequest(bot);
      });
  }

  return prequest(link, { json: true })
    .then(response => {
      // Параметр "key" устарел, нужно запросить новые "key" и "ts".
      if (response.failed && response.failed !== 1) {
        return makeARequest(bot);
      }

      // Обновляем "ts" для следующего запроса.
      link = link.replace(/ts=.*/, 'ts=' + response.ts);

      // Обновлений нет.
      if (!response.updates || !response.updates.length) {
        return makeARequest(bot, link);
      }

      // Отправляем новый запрос.
      makeARequest(bot, link);

      // Обрабатываем полученные обновления.
      processUpdates(bot.id, response.updates);
    })
    .catch(error => {
      // LongPoll Server ВКонтакте __очень__ часто возвращает 404, 500-504, ETIMEDOUT, ECONNRESET, и т.п.
      // Повторим запрос через 5 секунд.
      return setTimeout(() => makeARequest(bot), 5000);
    });
}

/**
 * Обрабатывает LongPoll обновления.
 * @param {Number} id ID бота
 * @param {Array} updates Массив обновлений (vk.com/dev/using_longpoll)
 * @private
 */
function processUpdates (id, updates) {
  log.info(`[id${id}] Processing LongPoll updates..`);

  for (let item of updates) {
    const mchatSenderId = item[7] && item[7].from && parseInt(item[7].from);
    const flags = item[2];

    if (
      // Новое сообщение.
      item[0] === 4 &&

      // Сообщение не прочитано.
      (flags & 1) !== 0 &&

      // Сообщение является входящим.
      (flags & 2) === 0 &&

      // Сообщение прислал друг.
      // * Пользователи, отправляющие сообщения в беседу, автоматически 
      // становятся "друзьями".
      (
        (flags & 32) !== 0 || mchatSenderId
      ) &&

      // Отправитель сообщения - не бот.
      (
        // Сообщение из беседы.
        mchatSenderId && mchatSenderId !== id ||

        // Сообщение из личного диалога.
        item[3] !== id
      )
    ) {
      emitter.emit(`message:${id}`, assembleMessage(item));

      continue;
    }
  }
}

/**
 * Собирает объект сообщения из массива LongPoll обновлений.
 * @param {Array} item
 * @returns {Object}
 */
function assembleMessage (item) {
  const attachments = item[7] || {};
  const messageId = item[1];
  let message = item[6] || '';
  let fwdMessage = null;

  const mchatSenderId = parseInt(attachments.from);
  const isMultichat = mchatSenderId && true || false;

  const conversationId = isMultichat ? (item[3] - 2000000000) : item[3];
  const senderId = isMultichat ? mchatSenderId : conversationId;

  // Decode some HTML entities.
  for (let i = 0, len = HTML_ENTITIES.length; i < len; i++) {
    message = message.replace(new RegExp(HTML_ENTITIES[i][0], 'g'), HTML_ENTITIES[i][1]);
  }

  // Parse forwarded message for personal chats.
  if (isMultichat && attachments.fwd) {
    if (attachments.fwd.includes(':')) {
      // Пересланных сообщений несколько, возвращаем последнее (т.е. самое новое).
      fwdMessage = attachments[`fwd${attachments.fwd.split(':')[0]}`];
    } else {
      // Пересланное сообщение только одно, возвращаем его.
      fwdMessage = attachments[`fwd${attachments.fwd}`];
    }
  }

  return {
    attachments, // Прикрепления к сообщению
    message, // Текст сообщения
    fwd_message: fwdMessage, // Текст пересланного сообщения (самого нового)
    message_id: messageId, // ID сообщения
    conversation_id: conversationId, // ID диалога
    sender_id: senderId, // ID отправителя сообщения
    is_multichat: isMultichat // true, если сообщение отправлено в беседу
  }
}

module.exports = {
  startGettingMessages: makeARequest,
  emitter
}
