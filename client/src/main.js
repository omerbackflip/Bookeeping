import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import excel from 'vue-excel-export'
import { setGoogleConfig } from '../../google/frontend';
import { formatDataForExport } from './utils/exportFormatter';

setGoogleConfig({
  pickerTokenUrl: `${process.env.VUE_APP_API_URL.replace('/specific', '')}/google/picker-token`,
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  apiKey: process.env.VUE_APP_GOOGLE_API_KEY,
  appId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: process.env.VUE_APP_GOOGLE_SCOPE,
});

Vue.use(excel)
Vue.config.productionTip = false

Vue.prototype.$formatDataForExport = formatDataForExport; // Make the Exports date format to DD/MM/YYYY globally available in the app

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')