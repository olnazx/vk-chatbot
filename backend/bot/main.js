'use strict';

/**
 * Module dependencies.
 * @private
 */
const auth = require('./base/authenticator');
const Bot = require('./base/Bot');
const log = require('../lib/logger')('bot', __filename);

const accounts = require('../config/accounts');

const bots = {};

auth(Object.keys(accounts).map(bot_id => accounts[bot_id].auth))
  .then(tokens => {
    for (let token of tokens) {
      bots[token.bot_id] = new Bot(token, accounts[token.bot_id].pattern);
    }

    log.info('All bots have been started.');
  })
  .catch(error => log.error('Unable to authorize bots.', error));

process.on('SIGINT', async () => {
  await require('../database/redis').quit();

  process.exit(0);
});
