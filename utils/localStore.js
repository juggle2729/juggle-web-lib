const put = (key, data) => {
  if (typeof data === 'object') data = JSON.stringify(data);
  localStorage.setItem(key, data);
};
const getValue = (key, isJson = false) => {
  let value = localStorage.getItem(key);
  if (value && isJson) value = JSON.parse(value);
  return value;
};
const remove = key => localStorage.removeItem(key);
export default {
  put,
  remove,
  getValue,
};
