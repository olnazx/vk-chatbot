'use strict';

/**
 * Local constants.
 * @private
 */
const LOL_WORD = 'АЗХ';

async function run ({ bot, args, options }) {
  const firstWord = parseInt(args.firstWord);
  let count;

  if (!firstWord) {
    count = options.default;
  } else {
    count = firstWord <= options.max && firstWord || options.default;
  }

  return LOL_WORD.repeat(count);
}

module.exports = {
  aliases: ['лол'],
  help_text: '/lol [кол-во]\n\nГенерирует смех определенной длины из символов АЗХ.',
  run
}
