'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ bot, args, options }) {
  return search('gif', { bot, args, options });
}

module.exports = {
  aliases: ['гиф', 'гифка'],
  help_text: '/gif <запрос> [кол-во]\n\nОсуществляет поиск .gif-документов во ВКонтакте по заданному запросу.',
  run
}
