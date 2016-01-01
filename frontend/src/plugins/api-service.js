import apiService from '../services/api-service';

export default function apiServicePlugin (Vue, pluginOptions) {
  Vue.prototype.$api = function executeRequest (url, options, callback) {
    if (pluginOptions.prefix && url[0] === '/') {
      url = pluginOptions.prefix + url;
    }

    return apiService(url, options, callback);
  }
}
