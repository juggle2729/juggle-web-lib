import {
  _invoke
} from './nativeInterface';
import nativeCode from './nativeCode';
import {
  register
} from './h5Interface';
import nativeCommon from './nativeCommon';
import {
  ref
} from 'vue';

const CHANNEL = {
  IOS: 'ios',
  ANDROID: 'android',
  H5: 'h5',
};

let _channel = null;
export let isAndroid = false;
export let isIOS = false;
export let isH5 = true;
export let isWx = false;
// 判断是否在微信内打开
let ua = navigator.userAgent;
isWx = ua.toLowerCase().indexOf('micromessenger') != -1;

export const isH5Ref = ref(true);

function init(query) {
  if (_channel) return;
  const {
    channel
  } = query;
  // if (!channel) {
  //   return;
  // }
  if (channel) {
    _channel = channel.toLocaleLowerCase();
    isAndroid = _channel == CHANNEL.ANDROID;
    isIOS = _channel == CHANNEL.IOS;
    isH5 = _channel == CHANNEL.H5;
  } else {
    isAndroid = ua.indexOf("Android") > -1 || ua.indexOf("Linux") > -1;
    isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    isH5 = !isAndroid && !isIOS
  }

  isH5Ref.value = isH5;
}

export function invoke(code, params, callbackData = null) {
  if (callbackData) {
    const {
      type,
      handle,
      isJson
    } = callbackData;
    register(type, handle, isJson);
  }
  return _invoke(code, params, {
    isAndroid,
    isIOS
  });
}

export const $bridge = {
  nativeCode,
  init,
  invoke
};

export default {
  install: app => {
    app.config.globalProperties.$bridge = $bridge;
    app.config.globalProperties.$nativeCommon = nativeCommon;
  },
};