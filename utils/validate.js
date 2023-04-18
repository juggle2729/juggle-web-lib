/**
 * 表单校验方法
 * @param {*} check 检验方法
 * @param {*} msg 检验未通过提示
 */
export function _v(check, msg) {
  return (rule, value, callback) => {
    if (!check(value)) {
      console.log('value', value, msg);
      callback(new Error(msg));
    } else {
      callback();
    }
  };
}

/* 合法手机号 */
export function isvalidPhone(str) {
  const reg = /^1[3456789]\d{9}$/;
  return reg.test(str);
}
/* 11位数字 */
export function isvalid11Number(str) {
  const reg = /^[0-9]{11}$/;
  return reg.test(str);
}
/* 身份证号 */
export function isvalidIdCard(str) {
  const reg =
    /^[1-9][0-7]\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/;
  return reg.test(str);
}

/* 合法uri */
export function validateURL(textval) {
  const urlregex =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}

/* 小写字母 */
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/;
  return reg.test(str);
}

/* 大写字母 */
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
}

/* 大小写字母 */
export function validatAlphabets(str) {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
}

/* 检验整数 */
export function isPositiveNum(str) {
  const reg = /^[0-9]+$/;
  return reg.test(str);
}

/* 检验正整数 >0 */
export function isPositiveNum2(str) {
  const reg = /^[1-9]\d*$/;
  return reg.test(str);
}

/* 检验两位小数 */
export function validatFixedTwo(str) {
  const reg = /^\d+(\.\d{0,2})?$/;
  return reg.test(str);
}

// 过滤特殊字符
export function checkSpecificKey(str) {
  const specialKey = "[`~!^&{}':;',\\[\\].<>?~！￥……&（）|{}‘；：”“'。，、？]‘'";
  for (let i = 0; i < str.length; i++) {
    if (specialKey.indexOf(str.substr(i, 1)) !== -1) {
      return false;
    }
  }
  return true;
}
/* 匹配url地址，以http/ftp/https开头 */
export function checkrl(str) {
  const reg = /(http|ftp|https):\/\/([\w.]+\/?)\S*/;
  return reg.test(str);
}

/* 正整数 */
export function checkBuyerno(str) {
  return str.replace(/[\W]/g, '');
}

/* 0-100的整数，可以包含2位小数 */
export function inspectionIntegerNum(str) {
  const reg = /^(\d|[1-9]\d|100)(\.\d{1,2})?$/;
  return reg.test(str);
}

/* 1-100的正数，可以包含2位小数 */
export function inspectionIntegerNum2(str) {
  let result = inspectionIntegerNum(str);
  if (result) {
    const num = +str;
    result = num >= 1 && num <= 100;
  }
  return result;
}

/* 0-100的正数，可以包含2位小数 */
export function inspectionIntegerNum3(str) {
  let result = inspectionIntegerNum(str);
  if (result) {
    const num = +str;
    result = num >= 0 && num <= 100;
  }
  return result;
}

/* 正整数 */
export function isvalidInteger(str) {
  const reg = /^[0-9]*[0-9][0-9]*$/;
  return reg.test(str);
}
/* 检验两位小数负数 */
export function validatFixedTwoMinus(str) {
  const reg = /^-?\d+(\.\d{0,2})?$/;
  return reg.test(str);
}

/* 合法uri */
export function validateUrl(textval) {
  const urlregex =
    /^(https|http):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}

/* 检验两位小数负数 */
export function isvalidateCn(str) {
  const reg = /^[\u4e00-\u9fa5]+$/;
  return reg.test(str);
}

/* 8-20位且至少包含字母大小写、数字中的两种 */
export function isvalidPassword(str) {
  const reg = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)[0-9A-Za-z]{8,20}$/;
  return reg.test(str);
}

/* 验证邮箱 */
export function isvalidEmail(str) {
  const reg = /^[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/;
  return reg.test(str);
}
/* 验证姓名 只能汉字+字母 */
export function isvalidName(str) {
  const reg = /^[a-zA-Z\u4e00-\u9fa5]+$/;
  return reg.test(str);
}
/* 验证姓名 只能汉字+字母+空格 */
export function isvalidNameBlank(str) {
  const reg = /^[a-zA-Z\u4e00-\u9fa5\s]+$/;
  return reg.test(str);
}
/* 验证是否输入表情  */
export function isvalidFace(str) {
  const reg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D-\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[A9|AE]\u3030|\uA9|\uAE|\u3030/ig;
  return reg.test(str);
}

/**
 * 校验姓名 排除不能输入表情 数字 特殊字符 外都能输入
 * **/
export function isvalidNameBlankNew(str) {
  const reg = /\d/
  return !reg.test(str) && !isvalidFace(str) && checkSpecificKey(str)
}
export default {
  /** 表单校验方法 */
  _v,
  /** 身份证号 */
  isvalidPhone,
  /** 密码 */
  isvalidPassword,
  /** 身份证号 */
  isvalidIdCard,
  /** 合法uri */
  validateURL,
  /** 小写字母 */
  validateLowerCase,
  /** 大写字母 */
  validateUpperCase,
  /** 大小写字母 */
  validatAlphabets,
  /** 检验整数 */
  isPositiveNum,
  /** 检验正整数 > 0 */
  isPositiveNum2,
  /** 检验两位小数 */
  validatFixedTwo,
  /** 过滤特殊字符 */
  checkSpecificKey,
  /** 匹配url地址，以http/ftp/https开头 */
  checkrl,
  /** 正整数 */
  checkBuyerno,
  /** 0-100的正数，可以包含2位小数 */
  inspectionIntegerNum,
  /** 1-100的正数，可以包含2位小数 */
  inspectionIntegerNum2,
  /** 0-100的正数，可以包含2位小数 */
  inspectionIntegerNum3,
  /** 正整数 */
  isvalidInteger,
  /** 检验两位小数负数 */
  validatFixedTwoMinus,
  /** 是否为邮箱 */
  isvalidEmail,
  /** 表情 */
  isvalidFace,

  /**
   * 校验姓名 排除法不能输入表情 数字 特殊字符 其他没有显示
   * **/
  isvalidNameBlankNew
};
