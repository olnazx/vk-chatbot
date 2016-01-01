/**
 * API Service
 * @param {String} url
 * @param {Object} options
 * @param {Function} callback
 */
export default function apiService (url, options, callback) {
  if (!url) {
    return;
  }

  options = options || {};

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  callback = callback || function () {};

  let request = new XMLHttpRequest();

  // Parse querystring params.
  if (options.qs) {
    url += '?';

    Object.keys(options.qs).forEach(key => {
      url += key + '=' + options.qs[key] + '&';
    });

    if (url.endsWith('&')) {
      url = url.slice(0, -1);
    }
  }

  request.open(options.method || 'get', url, true);

  request.onload = () => {
    let status = request.status;

    if (status >= 200 && status <= 399) {
      try {
        let response = JSON.parse(request.responseText);

        if (response.ok === true) {
          return callback(null, response.response);
        }

        if (response.ok === false) {
          return callback(response.cause);
        }

        return callback(null, response);
      } catch (e) {
        return callback('JSON.parse Error');
      }
    } else {
      callback('Status Code Error');
    }
  }

  request.onerror = () => {
    callback('Network Error');
  }

  request.send(options.body || null);
}
