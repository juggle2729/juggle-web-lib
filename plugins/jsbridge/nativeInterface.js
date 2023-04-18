// import { curry1 } from './fp';
// import { register } from './h5Interface';
// import helper from './helper';
// import { isAndroid, isIOS } from './index.js';
import { names } from '../../utils/base.js';
// import bridge from './bridge.js';
/**
 * 命令类型
 */
// const CMD = {
//   COMMON: 'common',
// };

// const curry1 = () => {};
// // 通用接口
// const cmdCommon = curry1(invoke, CMD.COMMON);
// /**
//  * 通用接口
//  * @param {String} type 类型
//  * @param {Object} params 对应数据
//  * @param {Object} callback 回调函数数据
//  */
// export function invokeCommon(type, params, callback) {
//   // 处理参数未传情况，默认为空对象
//   params = params || {};
//   let name = undefined;

//   if (callback) {
//     let autoName = `callbackFor${type}`;
//     if (typeof callback === 'function') {
//       callback = {
//         name: autoName,
//         handle: callback,
//       };
//     }
//     if (callback.handle) {
//       name = callback.name || autoName;
//       register(name, callback.handle);
//     }
//   }
//   cmdCommon({ type, params, callback: name });
// }

export function _invoke(code, params, { isAndroid, isIOS }) {
  // 转换为json字符串
  if (typeof params === 'object') params = JSON.stringify(params);
  // // 转码处理
  // if (params) params = encodeURIComponent(params);

  console.log(`invoke command ${code} params`, params, isIOS);

  if (isAndroid) {
    if (window.android && window.android.callAndroid) {
      window.android.callAndroid(code, params);
      console.log(`invoke ${code} success`);
    } else {
      console.log(`android对应接口callAndroid不存在或android未注入`);
    }
  } else if (isIOS) {
    // let iosCmd = names(`webkit.messageHandlers.${code}`);
    // bridge.callhandler('calliOS', { code, params }, (data) => {
    //   console.log(data);
    // })
    let iosCmd = names(`webkit.messageHandlers.calliOS`);
    if (iosCmd) {
      const iosParmas = { code, params };
      iosCmd.postMessage(iosParmas);
      // iosCmd.postMessage(JSON.stringify(iosParmas));
      console.log(`invoke ${code} success`);
    } else {
      console.log(`IOS对应接口calliOS不存在或未注入`);
    }
  } else {
    console.log(`h5不处理对应接口${code}`);
  }
}
