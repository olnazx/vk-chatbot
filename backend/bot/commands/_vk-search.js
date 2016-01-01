'use strict';

/**
 * Реализует функцию поиска во ВКонтакте.
 * Ищет аудио-, видеозаписи, фотографии и .gif-документы.
 *
 * Используется командами:
 *   gif.js
 *   music.js
 *   photo.js
 *   video.js
 */

/**
 * Module dependencies.
 * @private
 */
const checker = require('../base/Bot/Messages/processor/url-replacer').check;

/**
 * Local constants.
 * @private
 */
const NOT_FOUND_TEXT = 'По вашему запросу ничего не найдено.';

async function processCommand (type, { bot, args, options }) {
  let [query, count] = args.queryCount;

  if (!query) {
    return;
  }

  query = query.slice(0, 100);
  count = parseInt(count);
  count = count <= options.count.max && count || options.count.default;

  if (type === 'gif') {
    query = query + '.gif';
  }

  const params = Object.assign({}, { q: query, count }, options.params);

  return bot.api.call(options.label + '.search', params)
    .then(response => {
      const items = response.items;
      const attachments = [];

      if (!items.length) {
        return NOT_FOUND_TEXT;
      }

      for (let item of items) {
        if (type === 'gif' && item.ext !== 'gif') {
          continue;
        }

        if (type === 'music') {
          let fullTitle = item.artist + ' ' + item.title;

          // Название содержит запрещённые слова.
          if (checker(fullTitle)) {
            return 'Название аудиозаписи содержит запрещённые слова.';
          }
        }

        attachments.push(options.attach + item.owner_id + '_' + item.id);
      }

      if (!attachments.length) {
        return NOT_FOUND_TEXT;
      }

      return { attachments };
    });
}

module.exports = processCommand;
