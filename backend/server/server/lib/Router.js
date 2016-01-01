'use strict';

class Router {
  constructor () {
    this.routes = Object.create(null);
  }

  /**
   * Возвращает обработчик маршрута.
   * @param {String} url Маршрут
   * @returns {Function} Обработчик (undefined, если обработчика нет)
   * @public
   */
  resolve (url) {
    if (!url) {
      return;
    }

    return this.routes[url];
  }

  /**
   * Добавляет обработчик маршрута.
   * @param {String} path Маршрут
   * @param {Function} func Обработчик
   * @returns {Router}
   * @public
   */
  route (path, func) {
    if (!path || !func) {
      return;
    }

    // Добавляем начальный слэш, если его нет.
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Убираем слэши в конце строки, если они есть.
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    this.routes[path] = func;

    return this;
  }
}

module.exports = Router;
