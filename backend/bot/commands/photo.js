'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ bot, args, options }) {
  return search('photo', { bot, args, options });
}

module.exports = {
  aliases: ['фото'],
  help_text: '/photo <запрос> [кол-во]\n\nОсуществляет поиск фотографий во ВКонтакте по заданному запросу.',
  run
}
