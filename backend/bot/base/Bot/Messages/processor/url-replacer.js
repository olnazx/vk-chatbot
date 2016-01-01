'use strict';

/**
 * Module dependencies.
 * @private
 */
const restrictedWords = require('../../../../data/restricted');

/**
 * Local constants.
 * @private
 */
const REGEXP_DOMAINS = /\.(?:[a-gik-pr-uwxмор][ac-gi-su-yоруф][a-gk-mr-tvxzгс]?[acehiosuvк]?[einoyв]?[etwа]?e?)/gmi;
const REGEXP_WORDS = new RegExp(Object.keys(restrictedWords).join('|'), 'gmi');
const REPLACES = {
  // EN -> RU
  'a': 'а',
  'c': 'с',
  'e': 'е',
  'o': 'о',
  'p': 'р',
  'x': 'х',

  // RU -> EN
  'а': 'a',
  'е': 'e',
  'о': 'o',
  'р': 'p',
  'с': 'c',
  'х': 'x'
};

/**
 * Проверяет, есть ли в тексте запрещённые слова.
 * @param {String} text
 * @returns {Boolean}
 * @public
 */
function check (text) {
  let cleanText = text.replace(/[^а-яёa-z\s]/gmi, '');

  return REGEXP_WORDS.test(cleanText);
}

/**
 * Удаляет ссылки и запрещённые слова из сообщения.
 * @param {String} message
 * @returns {String} Обработанное сообщение
 * @public
 */
function replace (message) {
  // Очищаем сообщение от ссылок.
  let cleanMessage = message.replace(REGEXP_DOMAINS, match => `.${'*'.repeat(match.length - 1)}`);

  // В случайном порядке заменяем похожие русские буквы английскими и наоборот.
  cleanMessage = cleanMessage.replace(/.{1}/gmi, letter => {
    if (Math.random() < 0.5) {
      return letter;
    }

    let letterLowercased = letter.toLowerCase();

    if (REPLACES[letterLowercased] !== undefined) {
      let isLetterLowercased = letter === letterLowercased;

      return isLetterLowercased ? REPLACES[letterLowercased] : REPLACES[letterLowercased].toUpperCase();
    }

    return letter;
  });

  // Заменяем запрещённые слова, если они есть.
  if (REGEXP_WORDS.test(cleanMessage)) {
    cleanMessage = cleanMessage.replace(REGEXP_WORDS, match => restrictedWords[match]);
  }

  if (check(cleanMessage)) {
    cleanMessage = 'Пожалуйста, не используйте запрещённые слова при общении с ботом.';
  }

  return cleanMessage;
}

module.exports = {
  check,
  replace
}
