'use strict';

/**
 * Module dependencies.
 * @private
 */
const microsoftServices = require('./_microsoft-services');

async function run ({ bot, args, options }) {
  return microsoftServices('what-dog', { bot, args, options });
}

module.exports = {
  aliases: ['порода'],
  help_text: '/whatdog <изображение>\n\nОпределяет породу собаки по фото.',
  run
}
