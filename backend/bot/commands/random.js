'use strict';

async function run ({ bot, args, options }) {
  let firstWord = args.firstWord;
  let min;
  let max;

  if (!firstWord) {
    min = options.default.min;
    max = options.default.max;
  } else {
    if (firstWord.includes('-')) {
      let fromTo = firstWord.split('-');

      min = parseInt(fromTo[0]) || options.default.min;
      max = parseInt(fromTo[1]) || options.default.max;
    } else {
      min = options.default.min;
      max = parseInt(firstWord) || options.default.max;
    }
  }

  return `Случайное число: ${Math.floor(min + Math.random() * (max + 1 - min))}`;
}

module.exports = {
  help_text: '/random [диапазон]\n\nВернёт случайное число из указанного диапазона.',
  run
}
