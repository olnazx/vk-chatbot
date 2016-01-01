'use strict';

/**
 * Module dependencies.
 * @private
 */
const fs = require('fs');
const path = require('path');

class CommandList {
  /**
   * Constructor
   * @param {Object}
   *   @property {Number} bot_id ID бота
   *   @property {String} cmd_path Путь к папке с командами
   */
  constructor ({ bot_id, cmd_path }) {
    this.list = [];

    const files = fs.readdirSync(cmd_path);

    for (let filename of files) {
      if (!filename.endsWith('.js') || filename.startsWith('_')) {
        continue;
      }

      let commandName = filename.slice(0, -3);
      let commandFile = require(path.join(cmd_path, commandName));

      if (typeof commandFile.run === 'function') {
        this.list.push({
          name: commandName,
          run: commandFile.run,
          aliases: commandFile.aliases || [],
          help_text: commandFile.help_text || '',
          uniqueness: commandFile.uniqueness || ''
        });
      }
    }
  }

  /**
   * Возвращает объект команды, если такая команда найдена.
   * @param {String} command Команда
   * @returns {Object}
   * @public
   */
  get (command) {
    for (let item of this.list) {
      if (command === item.name || item.aliases.includes(command)) {
        return item;
      }
    }

    return null;
  }
}

module.exports = CommandList;
