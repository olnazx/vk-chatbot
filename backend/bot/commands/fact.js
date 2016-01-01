'use strict';

/**
 * Module dependencies.
 * @private
 */
const facts = require('../data/commands/fact');
const randomElem = require('./helpers/random-elem');

async function run ({ bot, args, options }) {
  return randomElem(facts);
}

module.exports = {
  aliases: ['факт'],
  help_text: '/fact\n\nПрисылает интересный факт.',
  run
}
