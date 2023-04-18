import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import layout2 from '../../packages/layout2/index.js';
import { i18n } from '@/i18n';
const { t } = i18n.global;
let ua = navigator.userAgent.toLowerCase();
// 判断是否企业微信环境
let isWxwork = ua.match(/WxWork/i) == "wxwork";


// 创建axios实例
const service = axios.create({
  baseURL: '/web/', // api的base_url
  timeout: 15000, // 请求超时时间
  withCredentials: true,
  crossDomain: true,
});

// request配置
service.interceptors.request.use(config => {
  let lang = localStorage.getItem('locale') || 'cn';
  let newLang = lang;
  if (lang == 'en') {
    newLang = 'en-US';
  } else if (lang == 'cn') {
    newLang = 'zh-CN';
  }
  config.headers.common['lang'] = newLang;
  const timeZone = new Date().getTimezoneOffset ? (new Date().getTimezoneOffset() / -60) : '+8';
  config.headers.common['tz'] = timeZone >= 0 ? `+${timeZone}` : timeZone;
  let url = config.url;
  // get参数编码
  if (config.method === 'get' && config.params) {
    url += '?';
    let keys = Object.keys(config.params);
    for (let key of keys) {
      if (config.params[key] !== null && config.params[key] !== undefined) {
        url += `${key}=${encodeURIComponent(config.params[key])}&`;
      }
    }
    url = url.substring(0, url.length - 1);
    config.params = {};
  }
  config.url = url;
  return config;
});

// respone拦截器
service.interceptors.response.use(
  response => {
    const Toast = getToast();

    // 10000000:成功
    const res = response.data;
    const config = response.config;
    if (res.code !== 10000000) {
      Toast.closeAll ? Toast.closeAll() : null;
      if (config && !config.catchFlag && !config.closeGlobeToast) {
        service.toast
          ? Toast({ message: res.message, duration: 2 * 1000 })
          : Toast({ message: res.message, type: 'error', duration: 2 * 1000 });
      }
      if ((res.code === 70000004 || res.code === 50000016) && isWxwork) {
        // router.replace({ path: '/login' });
        window.location.href = '/login';
        return;
      }
      // 50000003:未登录 60000001:token失效
      if ([50000003, 60000001].includes(res.code)) {
        const lang = localStorage.getItem('locale') || 'cn';
        sessionStorage.clear();
        localStorage.clear();
        // 清空 tabbars
        layout2.labelManager.clear();
        if (isWxwork) {
          axios.get('/web/sso').then(() => {
          }).catch((err) => {
            let locale = lang == 'en' ? lang : `zh-${lang}`;
            let dataUrl = `${err?.response?.data?.data?.redirectUrl}?&lang=${locale}`;
            if (dataUrl) {
              window.location.href = dataUrl;
            }
          })
        } else {
          router.replace({ path: '/login' });
        }
      }
      return Promise.reject(res.message);
    }
    return res.data;
  },
  error => {
    const config = error?.response?.config || {};
    const Toast = getToast();
    let err =
      error.message === 'Network Error' || error.message.indexOf('timeout of') !== -1
        ? t('systemManager.userPermission.E01_03_0174')
        : error.message;
    /*
     * if (err.message === 'Request aborted') {
     *   console.log('取消了请求');
     * }
     */
    if (!config.closeGlobeToast) {
      service.toast
        ? Toast({ message: err, duration: 2 * 1000 })
        : Toast({ message: err, type: 'error', duration: 2 * 1000 });
    }
    return Promise.reject(error);
  }
);

function getToast() {
  return service.toast || ElMessage;
}

export default service;
