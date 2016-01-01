'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');

async function run ({ bot, args, options }) {
  return prequest({
      url: 'https://source.unsplash.com/random/800x600',
      encoding: null,
      followAllRedirects: true
    })
    .then(buf => {
      return bot.api.upload('photo_pm', {
        data: {
          value: buf,
          options: {
            filename: 'image.jpg',
            contentType: 'image/jpg'
          }
        }
      });
    })
    .then(response => {
      return {
        attachments: 'photo' + response[0].owner_id + '_' + response[0].id
      }
    });
}

module.exports = {
  help_text: '/unsplash\n\nВернёт случайное изображение с unsplash.com.',
  run
}
