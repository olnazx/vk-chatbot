'use strict';

/**
 * Module dependencies.
 * @private
 */
const urlReplacer = require('./url-replacer');

/**
 * Собирает объект сообщения к отправке. 
 * @param {Object/String} resultObject  Объект, который вернул парсер
 * @param {Object} messageObject Исходный объект сообщения
 * @returns {Object}
 * @public
 */
function builder (resultObject = {}, messageObject = {}) {
  if (typeof resultObject === 'string') {
    resultObject = {
      message: resultObject
    }
  }

  const conversationType = messageObject.is_multichat ? 'chat_id' : 'user_id';
  const conversationId = messageObject.conversation_id;

  let message = resultObject.message || '';

  if (message && resultObject.replace_urls) {
    message = urlReplacer.replace(message);
  }

  let attachments = resultObject.attachments || '';

  if (attachments && Array.isArray(attachments)) {
    attachments = attachments.join(',');
  }

  let forwards = resultObject.forward_messages || '';

  if (forwards && Array.isArray(forwards)) {
    forwards = forwards.join(',');
  }

  if (!forwards) {
    if (resultObject.forward === true) {
      forwards = messageObject.message_id;
    }

    if (resultObject.forward === undefined) {
      forwards = messageObject.is_multichat ? messageObject.message_id : '';
    }
  }

  // Нечего отправлять.
  if (!(message || attachments || forwards)) {
    return null;
  }

  return {
    message,
    [conversationType]: conversationId,
    attachment: attachments,
    forward_messages: forwards
  }
}

module.exports = builder;
