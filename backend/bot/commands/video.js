'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ bot, args, options }) {
  return search('video', { bot, args, options });
}

module.exports = {
  aliases: ['видео'],
  help_text: '/video <запрос> [кол-во]\n\nОсуществляет поиск видеозаписей во ВКонтакте по заданному запросу.',
  run
}
