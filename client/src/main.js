import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import excel from 'vue-excel-export'
import { setGoogleConfig } from '../../google/frontend';

setGoogleConfig({
  pickerTokenUrl: `${process.env.VUE_APP_API_URL.replace('/specific', '')}/google/picker-token`,
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  apiKey: process.env.VUE_APP_GOOGLE_API_KEY,
  appId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: process.env.VUE_APP_GOOGLE_SCOPE,
});

Vue.use(excel)
Vue.config.productionTip = false

Vue.mixin({
  methods: {
    $formatDataForExport(data) {
      const isISODate = (str) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(str);
      const pad = (value) => `${value}`.padStart(2, '0');
      const formatDateValue = (value) => {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
          return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
        }
        if (typeof value === 'string' && isISODate(value)) {
          const date = new Date(value);
          if (!Number.isNaN(date.getTime())) {
            return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
          }
        }
        return value;
      };

      const format = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(format);
        }
        if (obj && typeof obj === 'object') {
          const newObj = {};
          for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
            const value = obj[key];
            if (value instanceof Date || (typeof value === 'string' && isISODate(value))) {
              newObj[key] = formatDateValue(value);
            } else if (typeof value === 'object' && value !== null) {
              newObj[key] = format(value);
            } else {
              newObj[key] = value;
            }
          }
          return newObj;
        }
        return obj;
      };

      return format(data);
    }
  }
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')