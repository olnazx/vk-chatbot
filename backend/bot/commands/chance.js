'use strict';

async function run ({ bot, args, options }) {
  if (!args.fullText) {
    return;
  }

  return `Вероятность -- ${Math.floor(Math.random() * 101)}%`;
}

module.exports = {
  aliases: ['шанс', 'инфа', 'вероятность'],
  help_text: '/chance <текст>\n\nОпределяет вероятность события.',
  run
}
