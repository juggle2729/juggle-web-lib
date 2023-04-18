import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

export default {
  install: app => {
    app.use(ElementPlus);
  },
};
