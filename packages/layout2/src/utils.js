export function isKeepAlive(meta = {}) {
  let result = true;
  if (meta.hidden) result = !meta.hidden;
  // 若设置了 unalive 则以这个参数为最终结果
  if (meta.unalive != null) result = !meta.unalive;

  return result;
}
