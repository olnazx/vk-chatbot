'use strict';

/**
 * Выбирает случайный элемент из массива
 * @param {Array} array
 * @public
 */
function randomElem (array) {
  return array[Math.floor(Math.random() * array.length)];
}

module.exports = randomElem;
