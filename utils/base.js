export const hasOwnProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
export const isType = type => target => Object.prototype.toString.call(target) == `[object ${type}]`;
export const isTypeModule = isType('Module');
export const isTypeString = isType('String');
export const isTypePromise = isType('Promise');

export const isEmptyObj = obj => Object.keys(obj).length == 0;

export const isEmptyStr = str => str === null || str === undefined || str === '';

// 往左边有条件的添加0
export const padLeftZero = str => `0${str}`.substr(str.length);

/**
 *
 * @param {*} target 不能为空
 * @param {*} names
 * @returns
 */
export const getAndCreateNamesObj = (target, names) => {
  if (!target) throw new Error('getAndCreateNamesObj target参数不能为空');
  let obj = target;

  while (names.length) {
    let name = names.shift();
    let temp = null;
    if (hasOwnProperty(obj, name)) {
      temp = obj[name];
    }
    if (!temp) {
      temp = {};
      obj[name] = temp;
    }
    obj = temp;
  }
  return obj;
};

export function names(value) {
  let splits = value.split('.');
  let obj = window;
  let count = 0;
  while (obj && count < splits.length) {
    obj = obj[splits[count]];
    count++;
  }
  return obj;
}

/**
 * 将时间转换为时间戳
 * @param {*} times
 */
export function convertTime2Stamp(times) {
  return times.map(date => +date);
}

/**
 * 将对象转换为url表单格式
 * @param {*} url
 * @param {*} params
 * @returns
 */
export function covertObj2URL(url, params) {
  if (params) {
    const hasSplit = url.includes('?');
    const appendParams = Object.entries(params).map(item => {
      let [key, value] = item;
      if (typeof value == 'object') value = JSON.stringify(value);
      return `${key}=${value}`;
    });
    url += (hasSplit ? '&' : '?') + appendParams.join('&');
  }
  return url;
}

export function parseTotal(total, max = 100, suffix = '+') {
  let result = total;
  if (total >= max) result = max - 1 + suffix;
  return result;
}
