import Vue from 'vue';
import App from './Main';
import apiServicePlugin from './plugins/api-service';

Vue.use(apiServicePlugin, {
  prefix: '/api/v1'
});

new Vue({
  ...App
}).$mount('#mount-point');
