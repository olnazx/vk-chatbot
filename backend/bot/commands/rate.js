'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');

async function run ({ bot, args, options }) {
  return prequest('http://zenrus.ru/build/js/currents.js')
    .then(response => {
      try {
        const rates = JSON.parse(response.split('=')[1].trim());

        return `💵 1 доллар = ${rates[0]} руб.\n` + 
               `💶 1 евро = ${rates[1]} руб.\n` + 
               `🛢 1 баррель нефти = $${rates[2]}`;
      } catch (e) {
        return 'Данные не были получены, повторите запрос позже.';
      }
    });
}

module.exports = {
  aliases: ['курс', 'доллар', 'евро', 'нефть'],
  help_text: '/rate\n\nПрисылает актуальный курс доллара, евро и нефти.',
  run
}
