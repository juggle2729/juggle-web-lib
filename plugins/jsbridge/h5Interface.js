// import { Toast } from 'antd-mobile';

const handlesKey = Symbol('handle');

let juggleH5 = { [handlesKey]: {} };

const proxyHandle = target => {
  const handler = {
    get(target, propKey) {
      let handleTarget = target[handlesKey];
      let result = Reflect.get(handleTarget, propKey);
      if (!result) {
        throw new ReferenceError(propKey + '方法未实现');
      }
      return result;
    },
  };
  return new Proxy(target, handler);
};

const proxy = proxyHandle(juggleH5);
window.juggleH5 = proxy;

// 通用common接口
// juggleH5.common = data => {
//   console.log('invoke juggleH5.common', typeof data, data);
//   try {
//     if (typeof data === 'string') {
//       // 适配传入为对象的情况
//       data = decodeURIComponent(data);
//       data = JSON.parse(data);
//     }
//     let { type, params } = data;
//     let handle = getHandle(type);
//     if (handle) {
//       handle(params);
//     } else {
//       console.log(`juggleH5.${type}接口未注册`);
//     }
//   } catch (e) {
//     console.log('decode or json error', data, e);
//   }
// };

// 注册未定义类型的接口，h5调用原生时，原生不存在对应的命令类型
register('callMsgEmpty', data => {
  // Toast.fail('当前版本不支持~', 1);
  console.log('invoke callMsgEmpty', data);
});

export function register(type, handle, isJson = true) {
  if (!type || !handle) {
    console.warn('接口注册名或处理函数不能为空');
    return;
  }
  console.log(`register ${type} success!`);
  juggleH5[handlesKey][type] = params => {
    if (isJson && typeof params == 'string') {
      params = JSON.parse(params);
    }
    handle.call(null, params);
  };
}
export default proxy;
