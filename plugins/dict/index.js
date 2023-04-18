import mixins from './mixins';
import { ref } from 'vue';
import { clone } from 'lodash';

const cache = {};
let lang = '';

/**
 * 缓存函数
 * @param {*} fn 需要缓存的函数
 * @param {*} getKey 如何获取缓存的数据的key，入参为fn的入参，默认取入参并json str处理
 * @param {*} checkNoHit 检测是否缓存命中，true为未命中，默认判断值是否为 res == null
 * @returns
 */
function memory(fn, getKey = (...params) => JSON.stringify(params), checkNoHit = val => val == null) {
  return (...params) => {
    // 取得key
    const key = getKey.apply(null, params);
    let val = cache[key];

    // 缓存不存在
    if (checkNoHit(val, params)) {
      val = fn.apply(null, params);
      // 缓存起来
      cache[key] = val;
    }
    return clone(val);
  };
}

// 根据字典项，取得对应的语言项的显示值
const _getLangValue = memory(
  (item, showPlaceholder = true) => {
    const { sysDictLanguageDTOS } = item;
    // const [lang = {}] = sysDictLanguageDTOS || [{}];
    // return lang.dictValue;
    // let languageType = localStorage.getItem('locale');
    // if (languageType) {
    //   if (['cn', 'zh'].includes(languageType)) {
    //     languageType = 'zn';
    //   } else {
    //     languageType = 'en';
    //   }
    // } else {
    //   languageType = 'zn';
    // }
    let languageType = ['cn', 'zh'].includes(lang) ? 'zn' : lang;
    let dict = sysDictLanguageDTOS.find(key => key.languageType === languageType);
    if (!dict) {
      /* eslint-disable */
      console.warn('请检查字典是否齐全');
      // 若对应语言字典不存在，就应用中文
      dict = sysDictLanguageDTOS.find(key => key.languageType === 'zn');
    }
    return dict?.dictValue || (showPlaceholder ? '-' : '');
  },
  item => {
    if (!item) return 'none';
    const { dictType, dictCode } = item;
    return 'val_' + lang + '_' + dictType + '_' + dictCode;
  },
  val => val == null || val == '-'
);

const _converOpts = (list, hasAll) => {
  let result = list
    .map(data => {
      const { id, parentId, dictCode, dictSort, dictType } = data;
      const dictValue = _getLangValue(data);
      return { id, parentId, dictCode, dictSort: +dictSort, dictType, dictValue };
    })
    .sort((a, b) => a.dictSort - b.dictSort);
  if (hasAll) {
    result = [{ dictValue: '全部', dictCode: '' }, ...result];
  }
  return result;
};

/**
 * 通过字典类型取得对应的节点列表
 * @param {*} list
 * @param {*} dictType
 * @returns
 */
const _opts = memory(
  (list, dictType, hasAll) => {
    let result = list.filter(data => data.dictType == dictType);
    // console.log('get opts', result);
    return _converOpts(result, hasAll);
  },
  (list, dictType, hasAll) => {
    let key = 'list_' + lang + '_' + dictType + '_' + (hasAll ? 1 : 0);
    // console.log('opts key', key)
    return key;
  },
  (val, params) => {
    if (!val || !val.length) return true;
    if (params[2] && val.length == 1) return true;
  }
);

/**
 * 通过字典类型取得对应节点列表及其可能存在的子节点，多级递归 类似这种格式[{children:[]}]
 * @param {*} list
 * @param {*} dictType
 */
const _optsCascader = function (list, dictType) {
  let result = _opts(list, dictType);
  result.forEach(item => {
    const children = _optsCascaderByParentId(list, item.id);
    if (children && children.length > 0) item.children = children;
  });
  return result;
};

/**
 * 通过父节点ID取得对应子节点列表
 * @param {*} list
 * @param {*} parentId
 * @returns
 */
const _optsByParentId = function (list, parentId, hasAll) {
  let result = list.filter(data => data.parentId == parentId);
  return _converOpts(result, hasAll);
};

/**
 * 通过父级类型及父级code取得对应的节点列表
 * @param {*} list
 * @param {*} parentDictType
 * @param {*} parentCode
 * @param {*} hasAll
 */
const _optsfp = function (list, parentDictType, parentCode, hasAll) {
  let result = list.filter(data => data.dictType == parentDictType);
  let parentNode = result.find(data => data.dictCode == parentCode);
  if (parentNode) {
    return _optsByParentId(list, parentNode.id, hasAll);
  }
  return [];
};

/**
 * 通过父节点ID取得对应子节点列表及其可能存在的的子节点，多级递归 类似这种格式[{children:[]}]
 * @param {*} list
 * @param {*} parentId
 */
const _optsCascaderByParentId = function (list, parentId) {
  let result = _optsByParentId(list, parentId);
  result.forEach(item => {
    const children = _optsCascaderByParentId(list, item.id);
    if (children && children.length > 0) item.children = children;
  });
  return result;
};

// 取字典列表数据
let dictData = new Map();
let dictList = ref([]);
// let dictMap = ref({});
const _getList = function (request, params, reset) {
  const { languageType } = params;
  lang = languageType;
  const key = languageType;
  let cache = dictData.get(key);

  if (reset || !cache) {
    cache = request(params);

    cache = cache
      .then(res => {
        // console.log('get dict list');
        dictList.value = res;
        // let map = {};
        // res.forEach(item => {
        //   if (!map[item.dictType]) {
        //     map[item.dictType] = {};
        //   }
        //   map[item.dictType][item.dictCode] = _getLangValue(item);
        // });
        // dictMap.value = map;
        return res;
      })
      .catch(() => {
        dictData.delete(key);
        return [];
      });

    dictData.set(key, cache);
  }

  return cache;
};

const _getDictItem = memory(
  (list, dictType, dictCode) => {
    if (!list || !list.length) return null;
    let result = list.find(item => {
      return item.dictType == dictType && item.dictCode == dictCode;
    });
    return result;
  },
  (list, dictType, dictCode) => {
    return 'item_' + lang + '_' + dictType + '_' + dictCode;
  }
);

// 根据dictType&&dictCode取得对应字典的dictValue
const _getVal = function (list, dictType, dictCode, showPlaceholder) {
  if (!list || !list.length) {
    return showPlaceholder ? '-' : '';
  }
  let result = _getDictItem(list, dictType, dictCode);
  if (!result) {
    return showPlaceholder ? '-' : '';
  }

  let val = _getLangValue(result, showPlaceholder) || '-';
  return val;
};

// 根据dictType匹配字典,返回options
export const getOpts = function (dictType, hasAll) {
  let list = dictList.value;
  return _opts(list, dictType, hasAll);
  // let result = list.filter(data => data.dictType == dictType);
  // return _converOpts(result, hasAll);
};

// 根据dictType&&dictCode取得对应字典的dictValue
export const getVal = function (dictType, showPlaceholder = true) {
  return dictCode => {
    let list = dictList.value;
    return _getVal(list, dictType, dictCode, showPlaceholder);
  };
};

// 根据dictType&&dictCode取得对应字典的dictValue，与上面的getVal方法重复了
export const getDictVal = function (dictType) {
  return dictCode => {
    // let map = dictMap.value;
    // if (!map[dictType]) return '-';
    // return map[dictType][dictCode] || '-';
    let list = dictList.value;
    return _getVal(list, dictType, dictCode);
  };
};

// 根据dictType&&dictCode&&父级dictType获取自身及父级对应字典的dictValue
export const getValWithParent = function (dictType, parentDictType) {
  return dictCode => {
    if (!dictCode) return '-';
    let list = dictList.value;
    let result = list.find(item => {
      return item.dictType == dictType && item.dictCode == dictCode;
    });
    if (!result || !result.parentId) return _getVal(list, dictType, dictCode);
    let parent = list.find(item => {
      return item.id == result.parentId;
    });
    return _getVal(list, parentDictType, parent.dictCode) + '-' + _getVal(list, dictType, dictCode);
  };
};

export const getVals = function (dictType, splitChar = ',') {
  const _getVal = getVal(dictType);
  return dictCodes => {
    if (!dictCodes) dictCodes = [];
    if (typeof dictCodes == 'string') {
      dictCodes = dictCodes.split(',');
    }
    return dictCodes.map(code => _getVal(code)).join(splitChar);
  };
};

const $dict = { _getVal, _opts, _optsfp, _optsByParentId, _optsCascader, _optsCascaderByParentId, _getList };

const $i18n = { locale: 'zh' };
export default {
  install: app => {
    app.config.globalProperties.$i18n = $i18n;
    app.config.globalProperties.$dict = $dict;
    app.mixin(mixins);
  },
};
