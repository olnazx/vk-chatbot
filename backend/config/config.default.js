'use strict';

/**
 * Основной конфиг приложения.
 */

/**
 * Module dependencies.
 * @private
 */
const path = require('path');

module.exports = {
  api: {
    // Данные аккаунта Cleverbot, через который бот получает ответы.
    cleverbot: {
      username: '<cleverbot_username>', // String
      password: '<cleverbot_password>' // String
    }
  },

  bot: {
    // Отправлять сообщения каждые * ms
    messages_delay: 1000,

    // Максимальное кол-во сообщений от пользователя в минуту,
    // которые будут обработаны.
    messages_per_minute: 15,

    // Время (в минутах), на которое блокируется пользователь, если
    // он пишет боту слишком часто.
    messages_lock_duration: 5,

    // Проверять заявки в друзья каждые * ms
    friends_delay: 1000 * 60,

    // Обновлять статус каждые * ms
    status_delay: 5 * 60 * 1000,

    // Дефолтное обращение к боту.
    default_pattern: /^бот[\s,]/i
  },

  // Настройки команд.
  // Передаются в переменную `options` при вызове команды.
  commands: {
    // commands/emo.js
    emo: {
      // Microsoft Emotion API free key
      api_key: '<emotions_api_key>'
    },

    // commands/gif.js
    gif: {
      attach: 'doc',
      count: {
        default: 3,
        max: 9
      },
      label: 'docs',
      params: {}
    },

    // commands/lastfm.js
    lastfm: {
      api_key: '<lastfm_free_api_key>'
    },

    // commands/lol.js
    lol: {
      default: 5,
      max: 90
    },

    // commands/music.js
    music: {
      attach: 'audio',
      count: {
        default: 3,
        max: 9
      },
      label: 'audio',
      params: {
        auto_complete: 1,
        lyrics: 0,
        performer_only: 0,
        sort: 2
      }
    },

    // commands/now.js
    now: {
      timezone_offset: 3
    },

    // commands/photo.js
    photo: {
      attach: 'photo',
      count: {
        default: 2,
        max: 9
      },
      label: 'photos',
      params: {
        sort: 1
      }
    },

    // commands/question.js
    question: {
      messages: {
        yes: 'Да',
        no: 'Нет',
        maybe: 'Может быть'
      },

      attachments: {
        yes: [
          'doc334600647_441421697',
          'doc334600647_441421706',
          'doc334600647_441421712',
          'doc334600647_441421718',
          'doc334600647_441421721',
          'doc334600647_441421729',
          'doc334600647_441421734',
          'doc334600647_441421738',
          'doc334600647_441421741',
          'doc334600647_441421743',
          'doc334600647_441421751',
          'doc334600647_441421755',
          'doc334600647_441421767',
          'doc334600647_441421778',
          'doc334600647_441421789',
          'doc334600647_441421805'
        ],

        no: [
          'doc334600647_441421815',
          'doc334600647_441421823',
          'doc334600647_441421842',
          'doc334600647_441421848',
          'doc334600647_441421855',
          'doc334600647_441421859',
          'doc334600647_441421863',
          'doc334600647_441421867',
          'doc334600647_441421880',
          'doc334600647_441421884',
          'doc334600647_441421891',
          'doc334600647_441421895',
          'doc334600647_441421897',
          'doc334600647_441421901',
          'doc334600647_441421907',
          'doc334600647_441421915',
          'doc334600647_441421922',
          'doc334600647_441421925',
          'doc334600647_441421928',
          'doc334600647_441421935',
          'doc334600647_441421939',
          'doc334600647_441422313',
          'doc334600647_441422318',
          'doc334600647_441422323',
          'doc334600647_441422336',
          'doc334600647_441422342',
          'doc334600647_441422348',
          'doc334600647_441422353',
          'doc334600647_441422355',
          'doc334600647_441422361',
          'doc334600647_441422362',
          'doc334600647_441422369',
          'doc334600647_441422370'
        ],

        maybe: [
          'doc334600647_441421663',
          'doc334600647_441421674',
          'doc334600647_441421684',
          'doc334600647_441421690'
        ]
      }
    },

    // commands/random.js
    random: {
      default: {
        min: 0,
        max: 100
      }
    },

    // commands/tts.js
    tts: {
      // ivona.com free api-key
      api: {
        accessKeyId: '<ivona_access_key>',
        secretAccessKey: '<ivona_secret_key>'
      },

      length: {
        min: 5,
        max: 1000
      }
    },

    // commands/video.js
    video: {
      attach: 'video',
      count: {
        default: 2,
        max: 9
      },
      label: 'video',
      params: {
        hd: 0,
        adult: 0,
        sort: 2
      }
    },

    // commands/warn.js
    warn: {
      photo_url: 'photo334600647_456239034'
    },

    // commands/weather.js
    weather: {
      // openweathermap.com free api-key
      api_key: '<owm_api_key>'
    }
  },

  path: {
    commands: path.resolve(__dirname, '../bot/commands/'),
    events: path.resolve(__dirname, '../bot/events/')
  }, 

  // Информация о приложении сообщества.
  vk_group_app: {
    id: <app_id>, // Number
    secret: '<app_secret>' // String
  },

  // Настройки web-части.
  www: {
    // Должен совпадать с портом, указанным в конфиге Nginx
    port: 3337
  }
}
