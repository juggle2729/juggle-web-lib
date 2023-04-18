/**
 * 往对象的指定函数名追加处理
 * @param {*} target
 * @param {*} fnName
 * @param {*} callback
 */
export function appendFn(target, fnName, callback) {
  if (!target) throw new Error('对象不能为空');
  if (!fnName) throw new Error('函数名不能为空');
  if (!callback) throw new Error('处理方法不能为空');

  let fnOld = target[fnName];
  if (!fnOld) {
    target[fnName] = callback;
  } else {
    target[fnName] = (...params) => {
      fnOld.apply(null, params);
      callback.apply(null, params);
    };
  }
}

// 简单curry
export function curry(fn) {
  return x => y => fn(x, y);
}

// 防抖
export function debounce(fn, duration = 500, isImmediate = false) {
  let timer, ctx, args;

  const later = () =>
    setTimeout(() => {
      if (!isImmediate) {
        fn.call(ctx, ...args);
        ctx = null;
        args = null;
      }
      timer = null;
    }, duration);
  return function () {
    if (timer) {
      clearTimeout(timer);
      timer = later();
    } else {
      timer = later();
      if (isImmediate) {
        fn.call(this, ...arguments);
      } else {
        ctx = this;
        args = arguments;
      }
    }
  };
}

//节流
export function throttle(fn, delay) {
  let valid = true;
  return function () {
    if (!valid) {
      //休息时间 暂不接客
      return false;
    }
    // 工作时间，执行函数并且在间隔期内把状态位设为无效
    valid = false;
    setTimeout(() => {
      fn.apply(null, arguments);
      valid = true;
    }, delay);
  };
}
