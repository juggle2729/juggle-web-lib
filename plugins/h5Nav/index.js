import { covertObj2URL } from '../../utils/base';
import nativeCommon from '../jsbridge/nativeCommon.js';

function _to(url, params) {
  // params.r = new Date().getTime();
  let href = covertObj2URL(url, params);
  window.location.href = href;
  // window.open(href);
  return href;
}

/** 页面跳转 */
function push(url, params) {
  _to(url, params);
}

/** 重定向 */
function replace(url, params) {
  _to(url, params);
}

/** 返回 */
function back() {
  nativeCommon.backOrClose();
}

export const h5Nav = { push, replace, back };
export default {
  install: app => {
    app.config.globalProperties.$h5Nav = h5Nav;
  },
};
