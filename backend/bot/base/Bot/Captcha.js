'use strict';

/**
 * Module dependencies.
 * @private
 */
const Redis = require('../../../database/redis');
const log = require('../../../lib/logger')('bot', __filename);

const waitingList = {};

/**
 * Определяет новую команду Redis, которая будет 
 * возвращать список активных капч для всех ботов.
 */
Redis.client.defineCommand('captchaGetAll', {
  numberOfKeys: 0, 
  lua: `
local matches = redis.call('KEYS', 'captcha:*')
local captcha = {}

for _,key in ipairs(matches) do
  local bot_id  = string.sub(key, 9)
  local captchs = redis.call('SMEMBERS', key)

  table.insert(captcha, { bot_id, captchs })
end

return captcha
`
});

/**
 * Подписывается на канал Redis для получения капчи.
 * @private
 */
function _subscribe () {
  // Подписываемся на канал, куда будут приходить разгаданные капчи.
  Redis.pubsub.psubscribe(
    // *:<bot_id>:<captcha_sid>
    'captcha:recognized:*',

    (error, count) => {
      if (error) {
        log.error('Unable to subscribe to channels.', error);
      }
    }
  );

  /**
   * Обрабатывает приходящие сообщения (сообщение = разгаданная капча).
   */
  Redis.pubsub.on('pmessage', (pattern, channel, message) => {
    if (waitingList[channel]) {
      // Resolving Promise with captcha_key.
      waitingList[channel](message);

      clearTimeout(waitingList[channel + '_timer']);

      delete waitingList[channel];
      delete waitingList[channel + '_timer'];
    }
  });
}

/**
 * Возвращает все активные капчи для всех ботов.
 * @returns {Promise:Array}
 * @public
 *
 * Формат данных:
 *   [
 *     [
 *       <bot_id>, 
 *       [
 *         <captcha_sid>, 
 *         ...
 *       ]
 *     ], 
 *
 *     [
 *       ...
 *     ]
 *   ]
 */
async function getAll () {
  return Redis.client.captchaGetAll();
}

/**
 * Добавляет активную капчу и ждёт, пока она будет распознана.
 * @param {Object}
 *   @property {Number} bot_id ID бота
 *   @property {String} sid Captcha SID
 * @public
 */
async function addAndWait (bot_id, sid) {
  await Redis.call('SADD', ['captcha:' + bot_id, sid]);

  return new Promise(resolve => {
    let waitKey = `captcha:recognized:${bot_id}:${sid}`;

    waitingList[waitKey] = resolve;

    // Подождём 10 минут и попробуем отправить сообщение,
    // если капча до сих пор не разгадана.
    waitingList[waitKey + '_timer'] = setTimeout(() => {
      // Значение переменной до сих пор хранится здесь.
      // Капча всё ещё не разгадана.
      if (waitingList[waitKey]) {
        // Удаляем капчу из активных.
        remove(bot_id, sid);

        resolve(null);

        clearTimeout(waitingList[waitKey + '_timer']);

        delete waitingList[waitKey];
        delete waitingList[waitKey + '_timer'];
      }

      waitKey = null;
    }, 10 * 60 * 1000);
  });
}

/**
 * Удаляет активную капчу.
 * @param {Object}
 *   @property {Number} bot_id ID бота
 *   @property {String} sid Captcha SID
 * @public
 */
async function remove (bot_id, sid) {
  return Redis.call('SREM', ['captcha:' + bot_id, sid]);
}

module.exports = {
  getAll,
  addAndWait,
  remove,

  _subscribe
}
