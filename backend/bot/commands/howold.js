'use strict';

/**
 * Module dependencies.
 * @private
 */
const microsoftServices = require('./_microsoft-services');

async function run ({ bot, args, options }) {
  return microsoftServices('how-old', { bot, args, options });
}

module.exports = {
  aliases: ['возраст'],
  help_text: '/howold <изображение>\n\nОпределяет возраст человека по фотографии.',
  run
}
