'use strict';

/**
 * Module dependencies.
 * @private
 */
const VKApi = require('./VKApi');
const CommandList = require('./CommandList');
const Messages = require('./Messages')
const Queue = require('./Queue');
const log = require('../../../lib/logger')('bot', __filename);
const config = require('../../../config');

class Bot {
  /**
   * Constructor
   * @param {Object} token
   *   @property {Number} bot_id ID бота
   *   @property {String} token Access token
   * @param {RegExp} pattern Паттерн обращения к боту
   */
  constructor (token, pattern) {
    /**
     * ID бота.
     * @type {Number}
     */
    this.id = token.bot_id;

    /**
     * Паттерн обращения к боту.
     * @type {RegExp}
     */
    this.pattern = pattern;

    /**
     * Экземпляр "VKApi" для взаимодействия с API ВКонтакте через бота.
     * @type {VKApi}
     */
    this.api = new VKApi({ token: token.token }, this.id);

    /**
     * Список команд, которые выполняет бот.
     * @type {CommandList}
     */
    this.commands = new CommandList({
      bot_id: token.bot_id, 
      cmd_path: config.path.commands
    });

    /**
     * Очередь сообщений бота.
     * @type {Queue}
     */
    this.queue = new Queue({
      limit: 25
    });

    // Запускаем бота.
    this.start();
  }

  /**
   * Запускает бота.
   * @public
   */
  start () {
    log.info(`[id${this.id}] Starting..`);

    this._startMessageProcessing();
    this._startMessageSending();
    this._startStatusUpdating();
    this._startFriendRequestsAccepting();
  }

  /**
   * Запускает процесс получения и обработки сообщений.
   * @private
   */
  async _startMessageProcessing () {
    Messages.provider.startGettingMessages(this);
    Messages.provider.emitter.on(`message:${this.id}`, async messageObject => {
      log.info(`[id${this.id}] New message received.`);

      // Очередь заполнена на максимум, новые сообщения 
      // обрабатываться не будут.
      if (this.queue.isFull()) {
        log.info(`[id${this.id}] Queue is full, message will not be processed.`);

        return;
      }

      const messageProcessed = await Messages.processor.process(this, messageObject);

      if (!messageProcessed) {
        return;
      }

      this.queue.enqueue(messageProcessed);

      log.info(`[id${this.id}] Message is processed and enqueued.`);
    });

    log.info(`[id${this.id}] Messages processing started.`);
  }

  /**
   * Запускает процесс отправки сообщений из очереди.
   * @private
   */
  _startMessageSending () {
    // Очередь сообщений пуста.
    if (this.queue.isEmpty()) {
      return setTimeout(() => this._startMessageSending(), config.bot.messages_delay);
    }

    const message = this.queue.dequeue();

    if (!message) {
      return this._startMessageSending();
    }

    // Отправляем сообщение.
    // 
    // Если при отправке сообщения появилась капча, то 
    // отправка следующего сообщения из очереди откладывается до тех пор, 
    // пока не будет разгадана капча и отправлено текущее сообщение. 
    // 
    // При этом, обработка входящих сообщений не прекращается. Однако, 
    // размер очереди сообщений ограничен. После достижения этого кол-ва 
    // сообщения обрабатываться не будут.
    Messages.sender.send(this, message)
      .then(response => {
        log.info(`[id${this.id}] Message was sent.`);

        setTimeout(() => this._startMessageSending(), config.bot.messages_delay);
      });
  }

  /**
   * Запускает процесс обновления статуса "Онлайн".
   * @private
   */
  async _startStatusUpdating () {
    try {
      await this.api.call('account.setOnline');
    } catch (error) {
      log.error(`[id${this.id}] Unable to update bot status.`, error);
    }

    setTimeout(() => this._startStatusUpdating(), config.bot.status_delay);
  }

  /**
   * Запускает процесс принятия входящих заявок в друзья, а также 
   * отклонения исходящих.
   * @private
   */
  async _startFriendRequestsAccepting () {
    try {
      await this.api.call('execute', {
        code: 'var rc = 12;' + 

              // Количество друзей всего.
              'var fc = API.friends.get({ count: 1 }).count;' + 

              // Исходящие заявки в друзья.
              'var ro = API.friends.getRequests({ count: 10, out: 1 }).items;' + 

              // Если исходящих менее 10, то можно добавить больше друзей.
              'if (ro.length < 10) { rc = rc + (10 - ro.length); }' + 

              // Входящие заявки в друзья.
              'var ri = API.friends.getRequests({ count: rc, sort: 0 }).items;' + 

              // Сколько заявок в друзья можно принять.
              'var ac = 10000 + ro.length - fc;' + 

              // Отклоняем исходящие заявки.
              'while (ro.length > 0) { API.friends.delete({ user_id: ro.shift() }); }' + 

              // Принимаем входящие заявки.
              'while (ac > 0 && ri.length > 0) { API.friends.add({ user_id: ri.shift() }); ac = ac - 1; }' + 
              'return "ok";'

      });
    } catch (error) {
      log.error(`[id${this.id}] Unable to accept friend requests.`, error);
    }

    setTimeout(() => this._startFriendRequestsAccepting(), config.bot.friends_delay);
  }
}

module.exports = Bot;
