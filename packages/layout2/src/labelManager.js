import { ref } from 'vue';
import { before } from './aop';
import { isKeepAlive } from './utils';
import EventEmit from './eventEmit';
import { cloneDeep } from 'lodash';

const labelListKey = 'juggle-label-list-20210903';
const labelSelectIdKey = 'juggle-label-select-id';

// 标签列表
let labelList = ref([]);
// 标签map
let labelMap = {};
// 隐藏菜单 map
let hideMenuMap = {};
// 当前激活状态的标签索引
let activeLabelItemRef = ref(null);

let currentRouter = null;

// let labelId = 0;
let labelIdMap = {};

// keppAlive 缓存
let keepAliveIncludes = ref([]);

// 主应用的路由实例
let mainRouter = null;

let isRead = false;
// 初始化处理
function init() {
  // addPageLeaveEvent();
  if (!isRead) {
    readStorage();
  }

  initHomePage();
}

function initHomePage() {
  if (labelList.value.length == 0) {
    // 首页
    const homeLabelItem = createLabel({ path: '/home', query: {}, params: {} });
    homeLabelItem.isHome = true;
    addLabelLink(homeLabelItem);
    updateActiveLabelItem(homeLabelItem);
  }
}

function getMax(list) {
  let max = list.reduce((res, cur) => {
    if (res < cur.labelId) return cur.labelId;
    return res;
  }, 0);
  return max;
}

// 读取本地数据
function readStorage() {
  let list = JSON.parse(sessionStorage.getItem(labelListKey)) || [];
  labelIdMap = list.reduce((res, cur) => {
    res[cur.labelId] = cur;
    return res;
  }, {});
  labelMap = list.reduce((res, cur) => {
    res[cur.labelMapKey] = cur;
    return res;
  }, {});
  // labelId = list.reduce((res, cur) => {
  //   if (res < +cur.labelId) res = cur.labelId + 1;
  //   return res;
  // }, 1);
  list = parseLabelList(list);
  labelList.value = list;
  isRead = true;

  // let selectId = +sessionStorage.getItem(labelSelectIdKey);
  // setTimeout(() => {
  //   let labelItem = labelIdMap[selectId];
  //   if (labelItem) {
  //     activeLabelItemRef.value = labelItem;
  //     // currentRouter.push(getLabelRouteData(labelItem));
  //   }
  // }, 10);
}

function parseLabelList(list) {
  return list.map(item => {
    const { nextNode, preNode, parentNode, subpathList } = item;
    item.nextNode = labelIdMap[nextNode];
    item.preNode = labelIdMap[preNode];
    item.parentNode = labelIdMap[parentNode];

    item.includeName && addInclude(item.includeName);

    if (subpathList && subpathList.length) {
      subpathList.forEach(path => _addInclude(path));
    }
    return item;
  });
}

// 防抖保存一下
function saveLabelList() {
  if (saveLabelList.timeId) return;
  saveLabelList.timeId = setTimeout(() => {
    let list = labelList.value.map(item => {
      const { nextNode, preNode, parentNode, ...rest } = item;
      rest.nextNode = nextNode && nextNode.labelId;
      rest.preNode = preNode && preNode.labelId;
      rest.parentNode = parentNode && parentNode.labelId;
      return rest;
    });
    sessionStorage.setItem(labelListKey, JSON.stringify(list));
    saveLabelList.timeId = null;
  }, 800);
}

function isLabelEqual(label1, label2) {
  if (label1 == null && label2 == null) return true;
  if (label1 == null) return false;
  if (label2 == null) return false;
  return label1.labelId === label2.labelId;
}

/**
 * 是否为当前 label
 * @param {*} labelItem
 * @returns
 */
function isCurrentLabel(labelItem) {
  return isLabelEqual(activeLabelItemRef.value, labelItem);
}

function routerHandler(router, isMain) {
  // currentRouter = router;
  updateCurrentRouter(router);

  if (isMain) mainRouter = router;
  const oldRouterBack = router.back;
  // 重写 router.back 方法
  router.back = (isUseOld = false) => {
    if (isUseOld) {
      oldRouterBack.apply(router);
    } else {
      back();
    }
  };

  // replace 之前，处理一下当前页签的子页面栈
  router.replace = before(router.replace, () => {
    if (hasSubpath(activeLabelItemRef.value)) {
      subpathPop(activeLabelItemRef.value);
    }
  });

  router.pushDirect = before(router.push, to => {
    if (localStorage.getItem('subName')) {
      const subName = localStorage.getItem('subName');
      to.path = `/${subName}${to.path}`;
    }

    const exitedLabel = findLabel(to);
    if (exitedLabel) {
      // 清空子页面栈
      subpathClear(exitedLabel);
    }
  });

  init();
  // console.log('tunie router handler', router.name);
  router.beforeEach((to, from) => {
    // console.log('tunie lib beforeEach', router.name, 'To:', to.path, 'From:', from.path);

    // if (is404Page(to)) {
    //   // currentRouter.replace('/error/404');
    //   return false;
    // }

    // 不生成标签的路由变化
    if (isUnlabel(to)) {
      return;
    }

    // 这里用于意见反馈页面
    if (location.search) {
      const paramStr = location.search.slice(1);
      const param = paramStr.split('&').reduce((total, cur) => {
        const [key, value] = cur.split('=');
        total[key] = value;
        return total;
      }, {});
      if (param.path) {
        currentRouter.replace({ path: `/${param.path}`, query: param });
        return;
      }
    }

    // 1.根据路由 path 查找对应的标签
    // const exitedLabel = findLabel(to) || findLabelAtMain(to, from);
    const exitedLabel = findLabel(to);
    // debugger
    if (exitedLabel) {
      updateActiveLabelItem(exitedLabel);
      // 判断是否存在子页面栈
      if (hasSubpath(exitedLabel)) {
        let result = getLabelRouteData(exitedLabel);
        return result;
      }
      return;
    }

    // 2.判断是不是末级菜单
    if (isLeafMenu(to, from)) {
      let newLabel = createLabel(to);
      addLabelLink(newLabel);
      updateActiveLabelItem(newLabel);
      return;
    }
    // 3.隐藏的路由，
    // hide页面是否存在，不存在就显示在当前标签下
    let exitedRefLabel = findHideMenuRefLabel(to) || activeLabelItemRef.value;
    // 单独处理子应用类详情页面的跳转
    let list = labelList.value;
    list.forEach(item => {
      let pathlist = item.subpathList.filter(subpath => {
        return subpath.path === to.path;
      });

      if (pathlist.length) {
        exitedRefLabel = item;
        activeLabelItemRef.value = item;
      }
    });

    if (exitedRefLabel) {
      // 插入标签页面栈
      subpathPush(exitedRefLabel, to);
      updateHideMenuMap(to, exitedRefLabel);
      updateActiveLabelItem(exitedRefLabel);
      return;
    }
  });
}

// 是否为不存在的页面
// function is404Page(route) {
//   return route.matched.length === 0;
// }

// 不走 label 系统
function isUnlabel(route) {
  let { meta } = route;
  return meta.unlabel;
}

// 返回是否为末级菜单，目前是根据 meta 里的 hidden 属性判断(meta 是处理过的)
function isLeafMenu(to, from) {
  const { meta } = to;
  if (!meta) return true;
  const { hidden, isDetailPage, isLeaf } = meta;
  let result = !hidden;
  if (isDetailPage != null) result = !isDetailPage;
  if (isLeaf != null) result = isLeaf;
  // TODO: 详情页跳详情页不会生成新标签 逻辑不完善待补充
  if (!Object.prototype.hasOwnProperty.call(meta, 'hidden') && !Object.prototype.hasOwnProperty.call(meta, 'isLeaf') && !Object.prototype.hasOwnProperty.call(meta, 'isDetailPage')) {
    const toPath = to.path.toLowerCase();
    const fromPath = from.path.toLowerCase();
    if (toPath.indexOf('detail') > -1 && fromPath.indexOf('detail') > -1) {
      result = false;
    }
  }
  return result;
}

// 返回否存在子页面栈
function hasSubpath(labelItem) {
  if (!labelItem) return false;
  return labelItem.subpathList.length > 0;
}

function lastItem(list) {
  return list[list.length - 1];
}

function isPathEqual(r1, r2) {
  return getHideMenuKey(r1) == getHideMenuKey(r2);
}

// 插入一条子页面
function subpathPush(labelItem, subpath) {
  let subpathList = labelItem.subpathList;
  let last = lastItem(subpathList);
  if (last && isPathEqual(last, subpath)) return;
  const { path, query, params, href, name, meta } = subpath;
  // 如果是子应用重新处理详情类页面labelList的缓存数据
  if (labelItem.path.indexOf('/lcms-') > -1) {
    if (query && query.subapp) {
      let pathlist = labelItem.subpathList.filter(itempath => {
        return itempath.path === path;
      });

      if (!pathlist.length) {
        labelItem.subpathList.push({ path, query, params, href, name, meta });
      }
    } else {
      let list = labelList.value;
      list.forEach(item => {
        if (
          item.path === labelItem.path &&
          path.split('/')[1].indexOf('lcms-') === labelItem?.path.split('/')[1].indexOf('lcms-')
        ) {
          let pathlist = item.subpathList.filter(itempath => {
            return itempath.path === path;
          });

          if (!pathlist.length) {
            item.subpathList.push({ path, query, params, href, name, meta });
          }
        }
      });
    }
  } else {
    let pathlist = labelItem.subpathList.filter(itempath => {
      return itempath.path === path;
    });

    if (!pathlist.length) {
      labelItem.subpathList.push({ path, query, params, href, name, meta });
    }
  }

  _addInclude(subpath);

  saveLabelList();
}

function subpathClear(labelItem) {
  let subpath = labelItem.subpathList;
  if (subpath.length > 0) {
    subpath.forEach(path => {
      removeInclude(path.name);
      updateHideMenuMap(path, null);
    });
    labelItem.subpathList = [];
    saveLabelList();
  }
}

function subpathPop(labelItem) {
  let subItem = labelItem.subpathList.pop();
  removeInclude(subItem.name);
  updateHideMenuMap(subItem, null);
  saveLabelList();

  return subItem;
}

function getLabelRouteData(labelItem, type) {
  if (type) return labelItem;
  if (hasSubpath(labelItem)) {
    return lastItem(labelItem.subpathList);
  }
  return labelItem.labelRouteData;
}

// 根据 path 取得对应的标签
function findLabel(path) {
  let labelMapKey = getLabelMapKey(path);
  let currLabel = labelMap[labelMapKey];
  return currLabel;
}

// 根据 path 取得对应的标签 当findLabel方法找不到的时候主应用返回的时候使用
// function findLabelAtMain(to, from) {
//   const activeLabelItem = activeLabelItemRef.value;
//   if (
//     !activeLabelItem ||
//     !to?.path ||
//     !from?.path ||
//     (to?.path.split('/')[1] === from?.path.split('/')[1] &&
//       to?.path.split('/')[1].indexOf('lcms-') > -1 &&
//       from?.path.split('/')[1].indexOf('lcms-') > -1)
//   ) {
//     return;
//   }
//   if (activeLabelItem.subpathList?.find(item => item.path === to.path)) {
//     return labelMap[activeLabelItem.path];
//   }
// }

// 查找隐藏路由对应标签
function findHideMenuRefLabel(route) {
  let key = getHideMenuKey(route);
  return hideMenuMap[key];
}

// 添加一条记录
function updateHideMenuMap(route, labelItem = null) {
  let key = getHideMenuKey(route);
  hideMenuMap[key] = labelItem;
}

// 取得隐藏菜单对应的 key
function getHideMenuKey(route) {
  return route.href;
}

// 根据路由数据生成并添加一个新的标签
function createLabel(route) {
  // 根据 route 生成一个标签对象
  const { path, meta, query, params, name } = route;
  const routeDataPath = getRouteDataPath(route);
  const labelMapKey = getLabelMapKey(route);
  let labelId = getMax(labelList.value) + 1;

  // let includeName = name;
  // if (isKeepAlive(meta)) {
  //   addInclude(includeName);
  // }
  _addInclude(route);

  let labelItem = {
    labelId,
    path,
    meta,
    labelRouteData: { path, query, params },
    routeDataPath,
    labelMapKey,
    subpathList: [],
    isShow: true,
    preNode: null,
    nextNode: null,
    includeName: name,
  };

  // 添加 map 记录
  // saveLabelMap(route, labelItem);
  labelMap[labelMapKey] = labelItem;

  return labelItem;
}

function addLabelLink(labelItem, preItem = null) {
  const list = labelList.value;
  if (!preItem) {
    preItem = list[list.length - 1];
    list.push(labelItem);
  } else {
    // insert
    let index = list.indexOf(preItem);
    list.splice(index + 1, 0, labelItem);
    // 父级节点
    labelItem.parentNode = preItem;
  }

  if (preItem) {
    labelItem.preNode = preItem;
    if (preItem.nextNode) {
      preItem.nextNode.preNode = labelItem;
    }
    preItem.nextNode = labelItem;
  }

  saveLabelList();
}

// 更新当前激活label的数据
function updateActiveLabelItem(labelItem) {
  const labelId = labelItem && labelItem.labelId;
  sessionStorage.setItem(labelSelectIdKey, labelId);

  if (isLabelEqual(labelItem, activeLabelItemRef.value)) return;
  activeLabelItemRef.value = labelItem;

  updateList();
}

function removeItem(labelItem) {
  // 节点关系处理
  let next = labelItem.preNode;
  next.nextNode = labelItem.nextNode;
  if (labelItem.nextNode) labelItem.nextNode.preNode = next;

  // 数据清理
  let list = labelList.value;
  let index = list.indexOf(labelItem);
  list.splice(index, 1);
  labelMap[labelItem.labelMapKey] = null;

  if (isLabelEqual(activeLabelItemRef.value, labelItem)) {
    // currentRouter.push(next.labelRouteData);
    // mainRouter.push(next.labelRouteData);
    routeRedirct(next);
  }

  subpathClear(labelItem);
  removeInclude(labelItem.includeName);
  // 本地持久化处理
  saveLabelList();
}

function getRouteDataPath(route) {
  let { path, matched = [] } = route;
  // 处理合并单个子菜单的路由，取子菜单的上级菜单数据
  let realPathRoute = matched.find(item => item.meta.isMergeSubMenu);
  if (realPathRoute) {
    path = realPathRoute.path;
  }
  return path;
}

// 保存标签
function getLabelMapKey(route) {
  let { matched = [] } = route;
  // 处理合并单个子菜单的路由，取子菜单的上级菜单数据
  let realPathRoute = matched[matched.length - 1];
  if (!realPathRoute) realPathRoute = route;
  return realPathRoute.path;
}

// 返回详情
function back() {
  const activeItem = activeLabelItemRef.value;
  const cloneActiveItem = cloneDeep(activeItem);
  if (hasSubpath(activeItem)) {
    // 如果是子应用的返回，重新处理labellist缓存数据,按照顺序删除最后一条数据
    if (activeItem.path.indexOf('/lcms-') > -1) {
      let list = labelList.value;
      list.forEach(item => {
        if (item.path == activeItem.path) {
          const info = item.subpathList.pop();
          removeInclude(info?.name);
        }
      });
      saveLabelList();
    } else {
      // 有子节点
      subpathPop(activeItem);
    }
    const routerData = getLabelRouteData(activeItem);
    const activeData = getLabelRouteData(cloneActiveItem);
    const isSame = isSameSubLabelPath(routerData.path, activeData.path);

    const { path, query = {}, params = {} } = routerData;
    // 增加本地子应用单独运行时的菜单跳转逻辑判断（subName）
    if (isSame || !localStorage.getItem('subName')) {
      currentRouter.push({ path, query, params });
    } else {
      mainRouter.push({ path, query, params });
    }
    // let nextRouteData = getLabelRouteData(activeItem);
    // nextRouteData = { ...nextRouteData, name: '' };
    // if (nextRouteData.path.indexOf('/lcms-') > -1) {
    //   currentRouter.push(nextRouteData);
    // } else {
    //   mainRouter.push(nextRouteData);
    // }
    // window.history.pushState(nextRouteData.query, null, nextRouteData.path);
  } else {
    currentRouter.back(true);
  }
}

// 取消
function cancel() {
  // const activeItem = activeLabelItemRef.value;
  // removeItem(activeItem);
  back();
}

// 返回否为选中项
function isActive(labelItem) {
  return isLabelEqual(labelItem, activeLabelItemRef.value);
}

// 监听页面离开事件
// function addPageLeaveEvent() {
//   // 只有屏幕和用户互动过后，用户离开页面（关闭、刷新、跳转其他页面）才会触发
//   window.onbeforeunload = event => {
//     if (event) {
//       event.returnValue = '关闭提示';
//     }
//   };
// }

/**
 * 清空
 */
function clear() {
  sessionStorage.removeItem(labelListKey);
  sessionStorage.removeItem(labelSelectIdKey);
  // init();
  labelList.value = [];
  labelMap = {};
  hideMenuMap = {};
  activeLabelItemRef.value = null;

  labelIdMap = 0;
  labelIdMap = {};

  initHomePage();
}

// ****** 针对显示列表的处理

let navbarWidth = -1;
let currentShowSizeRef = ref(-1);
const LABEL_WIDTH = 140;
const LABEL_HOME = 48;
const SELECT_MORE_WIDTH = 32;

function setNavbarWidth(value) {
  navbarWidth = value;
  updateLabelShowSize();
}

// 取得页签显示的个数
function updateLabelShowSize() {
  if (updateLabelShowSize.timeId) return;
  updateLabelShowSize.timeId = setTimeout(() => {
    if (navbarWidth > 0) {
      let lastWidth = navbarWidth - LABEL_HOME;
      let count = Math.floor(lastWidth / LABEL_WIDTH) + 1;
      if (count >= labelList.value.length) {
        currentShowSizeRef.value = count;
      } else {
        let modWidth = lastWidth % LABEL_WIDTH;
        if (modWidth < SELECT_MORE_WIDTH) {
          count = count - 1;
        }
        currentShowSizeRef.value = count;
      }
    } else {
      currentShowSizeRef.value = -1;
    }
    updateLabelShowSize.timeId = null;
  }, 400);
}

function updateList() {
  // insertItem(labelListShowSize, activeLabelItemRef.value);
  let showSize = currentShowSizeRef.value;
  if (showSize < 0) return;

  let list = labelList.value;
  let activeItem = activeLabelItemRef.value;
  let activeIndex = list.indexOf(activeItem);
  if (activeIndex >= showSize) {
    // 移除老的
    list.splice(activeIndex, 1);
    activeItem.preNode.nextNode = activeItem.nextNode;
    if (activeItem.nextNode) activeItem.nextNode.preNode = activeItem.preNode;
    // 插入到指定位置
    list.splice(showSize - 1, 0, activeItem);
    let tmpItem = list[showSize];
    tmpItem.preNode.nextNode = activeItem;
    activeItem.preNode = tmpItem.preNode;

    activeItem.nextNode = tmpItem;
    tmpItem.preNode = activeItem;

    saveLabelList();
  }
}

// 事件收发中心
const emit = new EventEmit();
function addLabelCloseListener(listener, target) {
  let activeItem = activeLabelItemRef.value;
  emit.add(activeItem.path, listener, target);
  return activeItem.path;
}
function removeLabelCloseListener(type, listener) {
  emit.remove(type, listener);
}
function emitRemoveItem(labelItem) {
  let type = labelItem.path;
  emit.notify(type);
}

function _addInclude(route) {
  const { name, meta } = route;
  if (isKeepAlive(meta)) {
    addInclude(name);
  }
}

function addInclude(name) {
  if (name) {
    let list = keepAliveIncludes.value;
    if (list.indexOf(name) < 0) {
      list.push(name);
    }
    if (labelManager.keepAliveIncludesNood) {
      labelManager.keepAliveIncludesNood(keepAliveIncludes.value);
    }
  }
}
function removeInclude(name) {
  keepAliveIncludes.value = keepAliveIncludes.value.filter(item => item != name);
  if (labelManager.keepAliveIncludesNood) {
    labelManager.keepAliveIncludesNood(keepAliveIncludes.value);
  }
}

// 跳转
function routeRedirct(labelItem, type) {
  if (type === 'MENU') {
    // 增加本地子应用单独运行时的菜单跳转逻辑判断（subName）
    if (labelItem.indexOf('lcms') > -1 || !localStorage.getItem('subName')) {
      currentRouter.push(labelItem);
    } else {
      mainRouter.push(labelItem);
    }
    return;
  }
  const routerData = getLabelRouteData(labelItem, type);
  const activeData = getLabelRouteData(activeLabelItemRef.value);

  const isSame = isSameSubLabelPath(routerData.path, activeData.path);
  const { path, query = {}, params = {} } = routerData;
  // 增加本地子应用单独运行时的菜单跳转逻辑判断（subName）
  if (isSame || !localStorage.getItem('subName')) {
    currentRouter.push({ path, query, params });
  } else {
    mainRouter.push({ path, query, params });
  }
}

// 判断当前当前path是否同一个子应用
function isSameSubLabelPath(path1, path2) {
  if (!path1) return false;
  if (!path2) return false;
  if (path1 === path2) return false;
  const labelPath = path1.split('/')[1];
  const subPath = path2.split('/')[1];
  if (labelPath === subPath && labelPath.indexOf('lcms-') > -1) {
    return true;
  }
  return false;
}

/**
 * 更新当前router
 * @param {*} val
 */
function updateCurrentRouter(val) {
  currentRouter = val;
  // 当将currentRouter置空时，就将currentRouter指向主应用router
  if (!val) currentRouter = mainRouter;
}

const labelManager = {
  keepAliveIncludes,
  addInclude,
  removeInclude,

  addLabelCloseListener,
  removeLabelCloseListener,
  emitRemoveItem,

  isLabelEqual,
  isCurrentLabel,
  routerHandler,
  labelList,
  activeLabelItemRef,
  currentShowSizeRef,
  updateActiveLabelItem,
  removeItem,
  back,
  cancel,
  isActive,
  clear,
  setNavbarWidth,
  routeRedirct,
  mainRouter,
  updateCurrentRouter,
};
export default labelManager;
