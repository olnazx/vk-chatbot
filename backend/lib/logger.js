'use strict';

const env = process.env.DEBUG || '';

function getNowDate () {
  const now = new Date();

  return `${now.getUTCDate()}.${now.getUTCMonth()}.${now.getUTCFullYear()}, ` +
         `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}`;
}

/**
 * Логгирует ошибки.
 * @param {String} namespace
 * @param {String} filename
 * @param {String} text
 * @param {Object} stack
 */
function error (namespace, filename, text, stack) {
  if (env && env !== '*' && !env.includes(namespace)) {
    return;
  }

  console.error(
    `[${namespace}][${filename}]`, 
    `[${getNowDate()}]`, 
    text, 
    stack && '\n' || '', 
    stack || ''
  );
}

/**
 * Логгирует сообщения.
 * @param {String} namespace
 * @param {String} filename
 * @param {String} text
 */
function info (namespace, filename, text) {
  if (env !== '*' && !env.includes(namespace)) {
    return;
  }

  console.log(
    `[${namespace}][${filename}]`, 
    `[${getNowDate()}]`, 
    text
  );
}

/**
 * 
 * @param {String} namespace
 * @param {String} filename
 * @returns {Object}
 * @public
 */
function logger (namespace, filename) {
  const file = filename.split('\/').slice(-2).join('\/');

  return {
    info: info.bind(null, namespace, file), 
    error: error.bind(null, namespace, file)
  }
}

module.exports = logger;
