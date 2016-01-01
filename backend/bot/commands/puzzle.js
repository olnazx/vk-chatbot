'use strict';

/**
 * Module dependencies.
 * @private
 */
const puzzles = require('../data/commands/puzzle');
const randomElem = require('./helpers/random-elem');

async function run ({ bot, args, options }) {
  return randomElem(puzzles);
}

module.exports = {
  aliases: ['загадка'],
  help_text: '/puzzle\n\nПрисылает случайную загадку с ответом.',
  run
}
