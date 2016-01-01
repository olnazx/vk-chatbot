'use strict';

/**
 * Module dependencies.
 * @private
 */
const CommandArguments = require('./helpers/command-arguments');
const log = require('../../lib/logger')('bot', __filename);
const config = require('../../config');

/**
 * Command
 * @param {Bot} bot Экземпляр "Bot"
 * @param {Object} message Объект сообщения
 * @public
 */
async function handler (bot, message) {
  const commandName = message.message.split(' ')[0].substr(1).toLowerCase();
  const command = bot.commands.get(commandName);

  // Такой команды не существует.
  if (!command) {
    return;
  }

  const convType = message.is_multichat ? 'mchat' : 'pm';

  // Команду нельзя использовать в этом диалоге.
  if (command.uniqueness && command.uniqueness !== convType) {
    return;
  }

  const commandArgs = new CommandArguments(message);

  // Если первый аргумент команды = '/?', то выводим помощь по ней.
  if (commandArgs.firstWord === '/?') {
    let helpText = command.help_text || '';

    if (command.aliases.length) {
      helpText += '\n\nАлиасы: /' + command.aliases.join(', /');
    }

    helpText = helpText || 'Описание к этой команде отсутствует.';

    return helpText;
  }

  return command.run({
      bot,
      args: commandArgs,
      options: config.commands[command.name] || {}
    })
    .catch(error => {
      if (error) {
        log.error(`[/${command.name}] Command error`, error);
      }

      return 'Произошла неизвестная ошибка. Повторите запрос позже.';
    })
}

module.exports = handler;
