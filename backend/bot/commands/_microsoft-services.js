'use strict';

/**
 * Реализует функции некоторых сервисов Microsoft:
 *   how-old.net  (howold.js)
 *   what-dog.net (whatdog.js)
 *
 * Работает без каких-либо токенов или авторизации.
 */

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');

/**
 * Local constants.
 * @private
 */
const SERVICE_URL = 'https://www.%type%.net/Home/Analyze';
const GENDER  = {
  'Female': '👩 Женщина',
  'Male': '👨 Мужчина'
};

/**
 * Преобразует ответ сервера в текстовое сообщение.
 * @param {String} type
 * @param {Object} response
 * @returns {String}
 * @private
 */
function processResponse (type, response) {
  let jsonResponse;

  try {
    jsonResponse = JSON.parse(JSON.parse(response));
  } catch (e) {
    return 'Данные не были получены. Попробуйте повторить запрос позже.';
  }

  if (type === 'how-old') {
    let faces = jsonResponse.Faces;
    let message = '';

    if (!faces.length) {
      return 'Не удалось обнаружить лицо на фотографии.';
    }

    for (let face of faces) {
      let attrs = face.attributes;

      message += GENDER[attrs.gender] + ', возраст ' + attrs.age + '\n';
    }

    return message;
  }

  if (type === 'what-dog') {
    if (jsonResponse.IsDog !== true) {
      return 'Не удалось обнаружить собаку на фотографии.';
    }

    return `Порода: ${jsonResponse.BreedName}`;
  }

  return null;
}

async function processCommand (type, { bot, args, options }) {
  const argPhoto = args.attachment('photo');

  if (!argPhoto) {
    return;
  }

  return bot.api.call('messages.getById', {
      message_ids: args.source.message_id
    })
    .then(response => {
      const key = response.items[0].attachments[0].photo.access_key;

      return bot.api.call('photos.getById', {
        photos: argPhoto + '_' + key
      });
    })
    .then(response => {
      const url = response[0].photo_604;

      return prequest({
        url,
        encoding: null
      });
    })
    .then(buf => {
      return prequest.post(SERVICE_URL.replace(/%type%/, type), {
        qs: {
          isTest: false
        },

        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': buf.length
        },

        body: buf
      });
    })
    .then(response => processResponse(type, response));
}

module.exports = processCommand;
