'use strict';

/**
 * Module dependencies.
 * @private
 */
const aws4 = require('aws4');
const prequest = require('request-promise');

/**
 * Local constants.
 * @private
 */
const RU_CHAR_CODES = [1072, 1103, 1105]; // а, я, ё (lowercase)
const DEFAULTS  = {
  femaleSwitchers: ['-f', '-female', '-ж'],
  ivona: {
    ru: {
      male: { Name: 'Maxim', Language: 'ru-RU', Gender: 'Male' },
      female: { Name: 'Tatyana', Language: 'ru-RU', Gender: 'Female' }
    },
    en: {
      male: { Name: 'Brian', Language: 'en-GB', Gender: 'Male' },
      female: { Name: 'Amy', Language: 'en-GB', Gender: 'Female' }
    }
  }
};

/**
 * Определяет, на русском ли языке написан переданный текст.
 * Считается, что язык текста - русский, если букв алфавита русского языка в тексте >= 50%.
 * [*] При расчёте удаляются все спец. символы, пробелы и цифры из строки.
 * @param {String} text
 * @returns {Boolean}
 * @private
 */
function detectRULang (text) {
  if (typeof text !== 'string') {
    return false;
  }

  // Удаляем спец. символы, пробелы и цифры.
  text = text.toLowerCase().replace(/[\s!"#\$%&'\(\)\*\+,\-\.\/\d:;<=>\?@\[\\\]\^_`\{\|\}~]/g, '');

  const textLength = text.length;
  let ruSymbCount = 0;

  // В тексте одни лишь спец. символы, пробелы и цифры => считаем его русским.
  if (textLength === 0) {
    return true;
  }

  for (let i = 0; i < textLength; i++) {
    let symCode = text[i].charCodeAt(0);

    if (symCode >= RU_CHAR_CODES[0] && symCode <= RU_CHAR_CODES[1] || symCode === RU_CHAR_CODES[2]) {
      ruSymbCount++;
    }
  }

  return (ruSymbCount / textLength) >= 0.5;
}

/**
 * Озвучивает текст.
 * @param {Object}
 *   @property {String} text
 *   @property {Object} voice
 *   @property {Object} api
 * @private
 */
function createSpeech ({ text, voice, api }) {
  const body = JSON.stringify({
    Input: {
      Data: text
    },

    Voice: voice
  });

  const signed = aws4.sign({
    path: '/CreateSpeech',
    hostname: 'tts.eu-west-1.ivonacloud.com',
    service: 'tts',
    method: 'POST',
    region: 'eu-west-1',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  }, api);

  // Озвучиваем текст
  return prequest.post({
    uri: 'https://tts.eu-west-1.ivonacloud.com/CreateSpeech',
    headers: signed.headers,
    encoding: null,
    body
  });
}

async function run ({ bot, args, options }) {
  let argText = args.fullText;
  const firstWord = args.firstWord;

  let gender = 'male';
  let lang = 'ru';

  if (!argText || argText.length < options.length.min) {
    return;
  }

  // Озвучка женским голосом.
  if (DEFAULTS.femaleSwitchers.includes(firstWord)) {
    gender = 'female';
    argText = argText.slice(firstWord.length + 1);
  }

  argText = argText.slice(0, options.length.max);

  // В тексте русских символов меньше 50%? Озвучиваем английским голосом
  if (!detectRULang(argText)) {
    lang = 'en';
  }

  return createSpeech({
    text: argText,
    voice: DEFAULTS.ivona[lang][gender],
    api: options.api
  })
  .then(buf => {
    return bot.api.upload('audio_msg', {
      data: {
        value: buf,
        options: {
          filename: 'audiofile.mp3',
          contentType: 'audio/mpeg'
        }
      }
    });
  })
  .then(response => {
    return {
      attachments: 'doc' + response[0].owner_id + '_' + response[0].id
    }
  });
}

module.exports = {
  aliases: ['скажи'],
  help_text: `/tts [${DEFAULTS.femaleSwitchers.join(' | ')}] <текст>\n\nОзвучивает указанный текст.`,
  run
}
