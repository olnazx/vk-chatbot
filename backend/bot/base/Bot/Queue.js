'use strict';

/**
 * Класс, реализующий работу очереди сообщений.
 */
class Queue {
  constructor (options) {
    /**
     * Очередь сообщений.
     * @type {Array}
     * 
     *   [
     *     [chatId, message],
     *     ...
     *   ]
     */
    this.queue = [];

    /**
     * Максимальное кол-во сообщений в очереди.
     * @type {Number}
     */
    this.limit = options.limit || 50;
  }

  /**
   * Помещает сообщение в конец очереди.
   * @param {Object} message Объект сообщения
   * @public
   */
  enqueue (message) {
    const conversationId = message.chat_id || message.user_id;

    /**
     * * Только для сообщений без прикреплений.
     * 
     * Если в очереди есть сообщение в диалог conversationId,
     * то добавляем к нему ещё одно и выходим из функции.
     * 
     * Если такого conversationId в очереди не оказалось,
     * то добавляем новое сообщение в очередь (по завершению цикла).
     */
    if (!message.attachment && !message.captcha_key) {
      // Пробегаемся по очереди и находим нужный conversationId
      for (let i = 0, len = this.queue.length; i < len; i++) {
        // Убедимся, что в сообщении нет прикреплений
        if (this.queue[i] && this.queue[i][0] === conversationId && !this.queue[i][1].attachment) {
          // Объединяем текущее сообщение с найденным сообщением в очереди
          this.queue[i][1].message += '\n\n' + message.message;
          this.queue[i][1].forward_messages += ',' + message.forward_messages;

          return;
        }
      }
    }

    // Если же сообщение содержит прикрепления, либо для данного сообщения не было
    // найдено подходящее сообщение в очереди (без прикреплений), то добавляем новый массив в конец очереди.
    this.queue.push([conversationId, message]);
  }

  /**
   * Удаляет первый элемент из очереди и возвращает его.
   * @public
   */
  dequeue () {
    const item = this.queue.shift();

    return item && item[1] || null;
  }

  /**
   * Удаляет все сообщения из очереди.
   * @public
   */
  clear () {
    this.queue = [];
  }

  /**
   * Удаляет все сообщения из очереди для определённой беседы.
   * @param {Number} chat_id ID беседы
   * @public
   */
  clearById (chat_id) {
    let i = 0;
    let len = this.queue.length;

    // Пробегаемся по очереди и удаляем из неё сообщения для беседы chat_id.
    while (i++ < len) {
      if (this.queue[i] && this.queue[i][0] === chat_id) {
        this.queue[i] = null;
      }
    }
  }

  /**
   * Вернёт true, если очередь пуста.
   * @returns {Boolean}
   * @public
   */
  isEmpty () {
    return this.queue.length === 0;
  }

  /**
   * Вернёт true, если очередь заполнена.
   * @returns {Boolean}
   */
  isFull () {
    return this.queue.length === this.limit;
  }
}

module.exports = Queue;
