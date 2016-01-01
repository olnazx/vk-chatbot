'use strict';

/**
 * Module dependencies.
 * @private
 */
const Redis = require('ioredis');
const log = require('../lib/logger')('redis', __filename);

const client = new Redis();
const pubsub = new Redis();

client.on('error', error => log.error('[client error]', error));
pubsub.on('error', error => log.error('[pubsub error]', error));

/**
 * Вызывает команду Redis.
 * @param {String} command Название команды
 * @param {Array} args Аргументы
 * @public
 */
async function call (command = '', args = []) {
  if (!command) {
    return;
  }

  // `args` должен быть массивом аргументов.
  if (!Array.isArray(args)) {
    return;
  }

  command = command.toLowerCase();

  // Такой команды не существует.
  if (client[command] === undefined) {
    log.error(`call(): Command ${command.toUpperCase()} is not exist.`);

    return;
  }

  // Пытаемся выполнить команду.
  return client[command](...args)
    .then(response => {
      if (command === 'hgetall') 
        if (!response || !Object.keys(response).length) {
          return;
        }

      return response;
    })
    .catch(error => {
      log.error(`call(): Unable to perform ${command.toUpperCase()} command.`, error);

      return;
    });
}

/**
 * Обвёртка для Redis.pipeline.
 * @param {Array} args Аргументы, как для Redis.pipeline
 * @public
 */
async function pipeline (args = []) {
  // Переменная "args" должна быть массивом аргументов.
  if (!args || !Array.isArray(args)) {
    return;
  }

  return client.pipeline(args).exec()
    .then(results => {
      const onlyResults = [];

      // Проверим, все ли команды успешно выполнились.
      for (let result of results) {
        if (result[0] !== null) {
          log.error('pipeline(): Error command response', result[0]);

          return;
        }

        onlyResults.push(result[1]);
      }

      return onlyResults;
    })
    .catch(error => {
      log.error('pipeline(): Pipeline request failed', error);

      return;
    });
}

/**
 * Обрывает соединения с сервером Redis.
 * @public
 */
async function quit () {
  log.info('quit(): Terminating connections..');

  return Promise.all([
    client.quit(), 
    pubsub.quit()
  ]);
}

module.exports = {
  call,
  pipeline,
  quit,

  client,
  pubsub
}
