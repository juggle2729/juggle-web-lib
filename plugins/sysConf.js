import { reactive } from 'vue';

export const sysConf = reactive({});
export default {
  install: app => {
    app.config.globalProperties.$sysConf = sysConf;
  },
};
