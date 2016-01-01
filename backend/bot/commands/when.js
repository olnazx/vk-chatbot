'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomElem = require('./helpers/random-elem');

/**
 * Local constants.
 * @private
 */
const VARIANTS = [
  'Не скажу',
  'Не знаю',
  'Никогда',
  'Сегодня',
  'Завтра',
  'Скоро',
  null,
  'Через несколько дней',
  'На этой неделе',
  'На следующей неделе',
  'Через две недели',
  'В этом месяце',
  'В следующем месяце',
  'В начале следующего месяца',
  'В этом году',
  'В конце года',
  'В следующем году'
];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

/**
 * Возвращает рандомную дату.
 * @private
 */
function randomDate () {
  const min = Date.now();
  const max = (new Date(2030, 0, 1)).getTime();

  return new Date(min + Math.random() * (max - min));
}

async function run ({ bot, args, options }) {
  if (args.isNull) {
    return;
  }

  let date = randomElem(VARIANTS);

  if (date === null) {
    const rdate = randomDate();
    const day = rdate.getDate();
    const month = rdate.getMonth();
    const year = rdate.getFullYear();

    date = `Это событие произойдет: ${day} ${MONTHS[month]} ${year} года.`;
  }

  return date;
}

module.exports = {
  aliases: ['когда'],
  help_text: '/when <событие>\n\nОпределяет, когда произойдет событие.',
  run
}
