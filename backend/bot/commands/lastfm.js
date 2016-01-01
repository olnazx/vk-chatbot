'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');
const striptags = require('striptags');

/**
 * Local constants.
 * @private
 */
const SERVICE_URL = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&format=json&lang=ru&autocorrect=1';

async function run ({ bot, args, options }) {
  const artist = args.fullText;

  if (!artist) {
    return;
  }

  return prequest(`${SERVICE_URL}&api_key=${options.api_key}&artist=${encodeURIComponent(artist)}`, {
      json: true
    })
    .then(response => {
      if (!response) {
        return 'Информация не получена. Попробуйте позже.';
      }

      if (response.error || !response.artist) {
        const code = response.error;

        if (code === 6) {
          return 'Указанный исполнитель не найден.';
        }

        if (code === 7 || code === 8 || code === 11 || code === 16 || code === 29) {
          return 'Сейчас запрос не может быть обработан. Попробуйте позже.';
        }

        if (code === 26) {
          throw 'Недействительный API-key.';
        }

        // Unknown error
        throw null;
      }

      let text = response.artist.name;

      if (response.artist.stats) {
        text += `\n\nСлушателей / прослушиваний: ${response.artist.stats.listeners} / ${response.artist.stats.playcount}`;
      }

      if (response.artist.bio && response.artist.bio.summary) {
        text += '\n\n' + striptags(response.artist.bio.summary, [], '\n\n');
      }

      const image = response.artist.image && response.artist.image[3] && response.artist.image[3]['#text'];

      if (!image) {
        return text;
      }

      return prequest(image, {
          encoding: null
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
            message: text,
            attachments: 'photo' + response[0].owner_id + '_' + response[0].id
          }
        });
    });
}

module.exports = {
  aliases: ['last', 'ластфм', 'ласт'],
  help_text: '/lastfm <исполнитель>\n\nПрисылает основную информацию об исполнителе.',
  run
}
