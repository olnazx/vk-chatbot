'use strict';

/**
 * Информация об аккаунтах ботов.
 */

module.exports = {
  <bot_id>: { // ID аккаунта бота

    // Паттерн обращения к боту
    pattern: <bot_pattern>, // RegExp

    auth: {
      login: '<bot_login>', // String
      pass: '<bot_password>' // String
    }
  },

  <...>
}
