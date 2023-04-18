import { getAndCreateNamesObj } from './base.js';

const convertKeys = key => {
  key = key.substring(2, key.length - 3);
  let list = key.split('/');
  return list;
};

export const convertModules = (context, ignoreFiles = {}, isLang = false) => {
  let result = {};
  context.keys().forEach(key => {
    if (ignoreFiles[key]) return;

    let mdl;
    //如果是多语言分包，需要取到default
    if (isLang) {
      mdl = context(key).default;
    } else {
      mdl = context(key);
    }
    // 用于异常路径打印
    mdl._path = key;

    let list = convertKeys(key);

    if (list.length == 1) {
      result[list[0]] = mdl;
    } else {
      let last = list.pop();
      let preNode = getAndCreateNamesObj(result, list);
      preNode[last] = mdl;
    }
  });

  return result;
};
