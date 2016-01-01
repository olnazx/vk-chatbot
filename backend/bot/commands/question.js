'use strict';

/**
 * Module dependencies.
 * @private
 */
const walker = require('walker-sample');
const randomElem = require('./helpers/random-elem');

const sampler = walker([
  [0.05, 'maybe'],
  [0.475, 'yes'],
  [0.475, 'no'],
]);

async function run ({ bot, args, options }) {
  if (!args.fullText) {
    return;
  }

  let answer = sampler();

  return {
    message: options.messages[answer],
    attachments: randomElem(options.attachments[answer])
  }
}

module.exports = {
  aliases: ['yesno', 'вопрос'],
  help_text: '/question <вопрос>\n\nЗадайте вопрос и получите ответ <<да>>, <<нет>> или <<может быть>>.',
  run
}
