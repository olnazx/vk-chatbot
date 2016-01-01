'use strict';

/**
 * Module dependencies.
 * @private
 */
const parsers  = require('./include/parsers');
const prequest = require('request-promise');

/**
 * Local constants.
 * @private
 */
const SERVICE_SEARCH_URL = 'http://stavklass.ru/images/search';
const SERVICE_RANDOM_URL = 'http://stavklass.ru/images/random.jpg';

async function run ({ bot, args, options }) {
  let url = SERVICE_SEARCH_URL;
  let encoding = 'utf8';
  let searchText = args.fullText;
  let paramName = 'image[text]';
  let isRandom = false;

  // Если запрос не указан, либо он === 'random', то
  // выставляем настройки для получения случайного изображения.
  if (!searchText || searchText === 'random') {
    url = SERVICE_RANDOM_URL;
    encoding = null;
    searchText = Date.now();
    paramName = 'n';
    isRandom = true;
  } else {
    // Обрезаем длинные поисковые запросы до 100 символов.
    searchText = searchText.slice(0, 100);
  }

  return prequest({
      url,
      encoding,
      qs: {
        [paramName]: searchText
      }
    })
    .then(response => {
      if (isRandom) {
        return response;
      }

      return parsers.parseStavKlassImgUrl(response)
        .then(imageUrl => {
          return prequest(imageUrl, {
            encoding: null
          });
        });
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
    })
    .catch(error => {
      // "photos_list is invalid"
      if (error.name === 'VKApiError' && error.code === 100) {
        return 'Не удалось загрузить найденное изображение.';
      }

      return 'По вашему запросу ничего не найдено.';
    });
}

module.exports = {
  aliases: ['класс'],
  help_text: '/klass [запрос]\n\nПо запросу присылает мемчики с сайта stavklass.ru.',
  run
}
