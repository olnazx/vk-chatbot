'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomElem = require('./helpers/random-elem');
const Conversation = require('../base/Bot/Messages/Conversation');

/**
 * Local constants.
 * @private
 */
const VARIANTS = {
  answerWords: [
    'Я думаю, это %username%',
    'Определенно, это %username%',
    'Несомненно, это %username%',
    'Мне кажется, что это %username%',
    'По-моему, это %username%',
    'Скорее всего, это %username%',
    'Все знают, что это %username%',
    'Это %username%, без сомнений.',
    '%username%. Кто ж ещё!',
    'Кто-кто.. Ты!'
  ], 

  noUsersAnswers: [
    'Не скажу.',
    'Не хочу говорить.',
    'У меня нет настроения тебе отвечать.',
    'Я не хочу тебе отвечать :p'
  ]
};

async function run ({ bot, args, options }) {
  if (!args.fullText) {
    return;
  }

  const chatUsers = await Conversation.getUsers(bot, args.source.conversation_id);
  let returnAnswer;

  if (chatUsers) {
    // Убираем бота из списка.
    delete chatUsers[bot.id];

    let randomUserName = chatUsers[randomElem(Object.keys(chatUsers))];

    returnAnswer = randomElem(VARIANTS.answerWords).replace(/%username%/, randomUserName);
  } else {
    returnAnswer = randomElem(VARIANTS.noUsersAnswers);
  }

  return {
    message: returnAnswer,
    replace_urls: true
  }
}

module.exports = {
  aliases: ['кто'],
  help_text: '/who <текст>\n\nВернёт случайного пользователя из списка участников беседы.',
  uniqueness: 'mchat',
  run
}
