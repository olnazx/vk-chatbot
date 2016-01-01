'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomElem = require('./helpers/random-elem');

async function run ({ bot, args, options }) {
  const convType = args.source.is_multichat ? 'mchat' : 'pm';

  const availableCommands = [];

  for (let command of bot.commands.list) {
    if (!command.uniqueness || command.uniqueness === convType) {
      availableCommands.push(command.name);
    }
  }

  return `Список команд, доступных в ${convType === 'pm' ? 'личных сообщениях' : 'беседе'}:\n\n` + 
         `/${availableCommands.join('\n/')}\n\n` + 
         'Чтобы получить помощь по определенной команде, напишите в чат: <<команда /?>>. ' + 
         `Например: /${randomElem(availableCommands)} /?`;
}

module.exports = {
  aliases: ['команды'],
  help_text: '/commands\n\nВыводит список доступных команд.',
  run
}
