'use strict';

async function run ({ bot, args, options }) {
  if (!args.fullText) {
    return;
  }

  return {
    message: 'Внимание, важная информация!',
    attachments: options.photo_url
  }
}

module.exports = {
  aliases: ['внимание'],
  help_text: '/warn <текст>\n\nПерешлет ваше сообщение с особым форматированием.',
  uniqueness: 'mchat', 
  run
}
