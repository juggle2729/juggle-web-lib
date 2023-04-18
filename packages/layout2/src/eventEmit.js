export default function EventEmit() {
  this.clear();
}

EventEmit.prototype = {
  // 添加一个事件监听
  add(type, listener, target) {
    let list = getHandleByType(this.handles, type);
    let newItem = { listener, target };
    let result = list.find(item => isSame(item, newItem));
    !result && list.push(newItem);
    console.log('add', this.handles);
  },
  // 删除事件监听
  remove(type, listener) {
    let list = getHandleByType(this.handles, type);
    let newlist = null;
    if (listener) {
      newlist = list.filter(item => !isSame(item, { listener }));
    }
    this.handles[type] = newlist;
  },
  clear() {
    this.handles = {};
  },
  // 触发一下˝
  notify(types) {
    if (!Array.isArray(types)) {
      types = [types];
    }

    Promise.resolve().then(() => {
      types.forEach(type => {
        let list = getHandleByType(this.handles, type);
        list.forEach(({ listener, target }) => {
          listener.call(target);
        });
      });
    });
  },
};

function isSame(v1, v2) {
  if (!v1 && !v2) return true;
  if (!v1 || !v2) return false;
  return v1.listener == v2.listener;
}

function getHandleByType(target, type) {
  let list = target[type];
  if (!list) {
    list = [];
    target[type] = list;
  }
  return list;
}
