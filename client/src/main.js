import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import excel from 'vue-excel-export'
import { setGoogleConfig } from '../../google/frontend';

setGoogleConfig({
  pickerTokenUrl: `${process.env.VUE_APP_API_URL.replace(/\/specific$/, '')}/google/picker-token`,
  clientId: '114393767822-2c83o787qugs9crttnlosskgfkb8jqsv.apps.googleusercontent.com',
  apiKey: 'AIzaSyBCJ6lUVaALeWkjO6NiYNztOqjQbQWebM8',
  appId: '114393767822',
  scope: 'https://www.googleapis.com/auth/drive.readonly'
});

Vue.use(excel)
Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')