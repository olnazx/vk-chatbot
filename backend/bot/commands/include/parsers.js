'use strict';

/**
 * Module dependencies.
 * @private
 */
const cheerio = require('cheerio');

module.exports = {
  parseStavKlassImgUrl (rbody) {
    return new Promise((resolve, reject) => {
      const $ = cheerio.load(rbody);
      const image = $('a.image');

      if (image.length === 0) {
        return reject(new Error('Not found'));
      }

      const imageUrl = image.eq(0).find('img').attr('src');

      return resolve(imageUrl);
    });
  }
}
