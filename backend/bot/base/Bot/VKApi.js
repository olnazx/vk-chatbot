'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');
const VKApi = require('node-vkapi');
const log = require('../../../lib/logger')('bot', __filename);
const Captcha  = require('./Captcha');

/**
 * Local constants.
 * @private
 *
 * [type, [var-name, upload-step-1, upload-step-2]]
 */
const FILE_TYPE = new Map([
  ['document', ['file', 'docs.getUploadServer', 'docs.save']],
  ['photo_pm', ['photo', 'photos.getMessagesUploadServer', 'photos.saveMessagesPhoto']]
]);

// Subscribe to channels.
Captcha._subscribe();

class Api {
  /**
   * Constructor
   * @param {Object} params
   *   @property {String} token Access token
   * @param {Number} bot_id ID бота
   */
  constructor (params, bot_id) {
    this.bot_id = bot_id;
    this.instance = new VKApi(params);

    /**
     * "Замороженные" методы: нужен ввод капчи.
     * @type {Set}
     */
    this.frozenMethods = new Set();
  }

  /**
   * "node-vkapi" .call() wrapper
   *
   * ## https://github.com/olnazx/node-vkapi/blob/master/lib/vkapi.js#L141
   */
  call (method, params) {
    // Метод "заморожен" до ввода капчи.
    if (this.frozenMethods.has(method)) {
      log.info(`[id${this.bot_id}] Method "${method}" is frozen.`);

      return Promise.reject('This method is frozen for now.');
    }

    return this.instance.call(method, params)
      .catch(async error => {
        if (error.name === 'VKApiError' && error.code === 14) {
          log.info(`[id${this.bot_id}] Captcha appeared, method "${method}"`);

          // "Заморозим" метод на время, т.к. его всё равно нельзя
          // будет использовать до ввода капчи.
          this.frozenMethods.add(method);

          const captchaSid = error.ext.captcha_sid;
          const captchaKey = await Captcha.addAndWait(this.bot_id, captchaSid);

          // "Разморозим" метод, т.к. ввод капчи, скорее всего, больше не нужен.
          this.frozenMethods.delete(method);

          // Капчу не разгадали за 10 минут, попробуем выполнить запрос снова.
          if (!captchaKey) {
            log.info(`[id${this.bot_id}] Captcha sid${captchaSid} have not been recognized.`);

            return this.call(method, params);
          }

          log.info(`[id${this.bot_id}] Captcha sid${captchaSid} have been recognized.`);

          // Капча была разгадана, отправляем запрос вместе с кодом с картинки.
          return this.call(
            method,
            Object.assign(
              params,
              {
                captcha_sid: captchaSid,
                captcha_key: captchaKey
              }
            )
          );
        }

        throw error;
      });
  }

  /**
   * "node-vkapi" .upload() wrapper
   *
   * ## https://github.com/olnazx/node-vkapi/blob/master/lib/files-upload.js
   */
  upload (type, params) {
    // "type" is not a string
    if (typeof type !== 'string') {
      return Promise.reject(new TypeError('"type" must be a string.'));
    }

    params.beforeUpload = params.beforeUpload || {};
    params.afterUpload = params.afterUpload || {};

    if (type === 'graffiti') {
      type = 'document';
      params.beforeUpload.type = 'graffiti';
    }

    if (type === 'audio_msg') {
      type = 'document';
      params.beforeUpload.type = 'audio_message';
    }

    // Unsupported type
    if (!FILE_TYPE.has(type)) {
      return Promise.reject(new Error('Type "' + type + '" is unsupported.'));
    }

    const fileToSend = params.data;

    // No file to upload
    if (!fileToSend) {
      return Promise.reject(new Error('"params.data" is undefined.'));
    }

    const [
      uploadVarName,
      getUploadURLMethodName,
      saveMethodName
    ] = FILE_TYPE.get(type);

    return this.call(getUploadURLMethodName, params.beforeUpload)
      .then(response => {
        return prequest.post(response.upload_url, {
          formData: {
            [uploadVarName]: fileToSend
          },
          json: true
        });
      })
      .then(response => {
        if (response.error) {
          throw new Error(response.error);
        }

        return this.call(saveMethodName, Object.assign(response, params.afterUpload));
      });
  }
}

module.exports = Api;
