import v from './validate'

function _handle(options = {}) {
  if (typeof options === 'string') options = { message: options }
  let { message, trigger = ['blur', 'change'] } = options
  return { message, trigger }
}

export function rRequired(options = {}) {
  return [{ required: true, ..._handle(options) }]
}

export function rRange(range, options = {}) {
  let { message, ...rest } = _handle(options)
  if (!message) {
    const { min, max } = range
    message = `${min}-${max}个字符`
  }
  return [{ ...rest, message, ...range }]
}

export function compose(...rules) {
  return rules.reduce((res, cur) => {
    if (Array.isArray(cur)) {
      res = [...res, ...cur]
    } else {
      res.push(cur)
    }
    return res
  }, [])
}

/** 可为空验证 */
export function rEmptyPass(check) {
  return value => {
    return value ? check(value) : true
  }
}

/**
 * @param {Object} options {messages, tirgger, check, type}
 */
export function _r(options) {
  const result = []
  const { messages, trigger = ['blur', 'change'], check, type } = options
  const [message1, message2] = messages
  result.push({ required: true, message: message1, trigger })
  if (message2) {
    // 若传入了check函数，则用check做验证; 若为type，则利用element ui的对应type验证。
    if (check) {
      result.push({ trigger, validator: v._v(check, message2) })
    } else if (type) {
      result.push({ trigger, type, message: message2 })
    }
  }
  return result
}

/** 通用 */
export function common(messages, check) {
  if (typeof messages === 'string') {
    messages = [messages]
  }
  return _r({ messages, check })
}

/** rate rules */
export function rRate(messages = '请输入税率', start = 1, check) {
  if (typeof messages === 'string') {
    messages = [messages, `请输入${start}-100，可以包含2位小数`]
  }
  check = check || v.inspectionIntegerNum2
  return _r({ messages, check })
}
/** email rules */
export function rEmail(messages = '请输入邮箱地址') {
  if (typeof messages === 'string') {
    messages = [messages, '请输入正确的邮箱地址']
  }
  return _r({ messages, check: v.isvalidEmail })
}
/** email more rules */
export function rEmailMore(messages = '请输入邮箱地址', sep = '&') {
  if (typeof messages === 'string') {
    messages = [messages, '请输入正确的邮箱地址']
  }
  // 对check进行处理
  const check = str => str.split(sep).every(value => v.isvalidEmail(value))
  return _r({ messages, check })
}
/** num rules */
export function rNum(messages, tip = '') {
  if (typeof messages === 'string') {
    messages = [messages, `请输入大于等于0的数，保留两位小数${tip}`]
  }
  return _r({ messages, check: v.validatFixedTwo })
}
/** postive num rules */
export function rPostiveNum(messages, check, tip = '(>0)') {
  if (typeof messages === 'string') {
    messages = [messages, `请输入正整数${tip}`]
  }
  check = check || v.isPositiveNum2
  return _r({ messages, check })
}
/** postive num rules */
export function rPostiveNum0(messages, tip = '', trigger) {
  if (typeof messages === 'string') {
    messages = [messages, `请输入整数${tip}`]
  }
  return _r({ messages, trigger, check: v.isPositiveNum })
}

export default {
  _r,
  common,
  compose,
  rRequired,
  rRange,
  rEmptyPass,
  rRate,
  rEmail,
  rEmailMore,
  rNum,
  rPostiveNum0,
  rPostiveNum
}
