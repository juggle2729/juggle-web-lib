// 清空为空的字符串参数
const clearEmptyStringParams = data => {
  let newData = {};
  for (let key in data) {
    let value = data[key];
    if (!value && typeof value === 'string') {
      // 过滤一下
    } else {
      newData[key] = value;
    }
  }
  return newData;
};

export function resolve(url, data = {}, isUrlVariable) {
  if (data instanceof Array) {
    return { url, data };
  }
  if (data) {
    let newData = data;
    if (isUrlVariable) {
      newData = clearEmptyStringParams(data);
    }
    url = url.split('/');
    url = url
      .map(item => {
        let [, s2] = item.split(':');
        if (s2) {
          item = data[s2];
          delete newData[s2];
        }
        return item;
      })
      .join('/');

    data = newData;
  }
  return { url, data };
}
