'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');

async function run ({ bot, args, options }) {
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

      return prequest.post({
        url: 'https://api.projectoxford.ai/emotion/v1.0/recognize', 

        headers: {
          'Content-Type': 'application/json', 
          'Ocp-Apim-Subscription-Key': options.api_key
        },

        body: {
          url
        },

        json: true
      });
    })
    .then(response => {
      if (!response || !response[0]) {
        return 'Не удалось обнаружить лицо на фотографии.';
      }

      let textToSend = '';
      const emotions = response[0].scores;

      for (let i = 0, emoKeys = Object.keys(emotions), len = emoKeys.length; i < len; i++) {
        emotions[emoKeys[i]] = (emotions[emoKeys[i]] * 100).toFixed(1) + '%';
      }

      if (response.length > 1) {
        textToSend += 'На фото более одного лица. Показываются эмоции только первого. \n\n';
      }

      textToSend += `😠 Злость: ${emotions.anger}\n` + 
                    `😏 Презрение: ${emotions.contempt}\n` + 
                    `😒 Отвращение: ${emotions.disgust}\n` + 
                    `😱 Страх: ${emotions.fear}\n` + 
                    `😊 Счастье: ${emotions.happiness}\n` + 
                    `😐 Нейтральность: ${emotions.neutral}\n` + 
                    `😞 Грусть: ${emotions.sadness}\n` + 
                    `😲 Удивление: ${emotions.surprise}`;

      return textToSend;
    })
    .catch(error => {
      // Одна из следующих ошибок:
      // 1. Ошибка парсинга JSON
      // 2. Не удалось спарсить положения лица на фото
      // 3. Лиц на фото более 64
      // 4. Не удалось определить content-type
      if (error.statusCode === 400) {
        return 'Невозможно распознать эмоции. Попробуйте загрузить другую фотографию.';
      }

      // 401: Недействительный ключ API
      // 403: Достигли месячного лимита API в 30000 запросов
      if (error.statusCode === 401 || error.statusCode === 403) {
        return 'Достигнут лимит запросов. Попробуйте через несколько дней.';
      }

      // Достигли минутного лимита
      if (error.statusCode === 429) {
        return 'Сейчас запрос не может быть обработан. Попробуйте через несколько минут.';
      }

      throw error;
    });
}

module.exports = {
  aliases: ['эмоции', 'эмо'],
  help_text: '/emo <изображение>\n\nОпределяет эмоции на лице человека.',
  run
}
