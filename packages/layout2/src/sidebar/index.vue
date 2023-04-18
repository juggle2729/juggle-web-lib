<template>
  <div :class="['lts-siderber2', 'sidebar2', { 'sidebar2--hide-sub': !rootLayout.isExpand }]">
    <sidebar-main :currentPath="currentPath" :menus="menuRoutes" @pathChange="handleSelect" @pathThird="handlePathThird">
      <slot></slot>
    </sidebar-main>
    <sidebar-sub v-if="!currentMenu.isThird" :menus="subRouteChildren"></sidebar-sub>
    <sidebar-expand v-if="!currentMenu.isThird"></sidebar-expand>
  </div>
</template>

<script>
import sidebarMain from './sidebarMain.vue';
import sidebarSub from './sidebarSub.vue';
import sidebarExpand from './sidebarExpand.vue';
// import { parse } from '../../../../../../../src/views/oms/cms/ele/editor/src/main'
import labelManager from '../labelManager';

// import {menuRoutes} from '@/router'
// import scrollBar from './scrollbar';
// import submenuItem from './submenuItem';

export default {
  components: { sidebarMain, sidebarSub, sidebarExpand },
  inject: ['rootLayout'],
  data() {
    return {
      startQueryMenu: true,
      path: '/',
      menuList: null,
      currentMenu: {}
    };
  },
  created() {
    this.startQueryMenu = true;
    this.path = this.$route.path;
    this.queryMenu();
  },
  props: {
    allMenulist: { type: Array, default: null },
    title: { type: String, default: '' },
    fnMenu: { type: Function, default: null },
  },
  computed: {
    routePath() {
      return this.$route.path;
    },
    currentPath() {
      const [, first, ...rest] = this.path.split('/');
      const result = { first: `/${first}`, second: `/${rest.join('/')}`, parentApplication: rest && rest.length && rest[0] };
      return result;
    },
    menuRoutes() {
      if (this.startQueryMenu) return [];
      // let r = this.$router.options.routes;
      let r = this.allMenulist || this.$router.options.routes;

      r = r.map(item => {
        const { children = [], ...rest } = item;
        rest.children = children && children.slice();
        return rest;
      });

      // 微应用改造后不需要处理，因为菜单从接口取到的数据
      // if (this.menuList) {
      //   // 过滤出有权限的菜单
      //   const menuMap = parseMenu(this.menuList);
      //   r = filterMenu(r, menuMap);
      // }
      let result = parseRoutes(r);
      this.$emit('routeChange', result);
      return result;
    },

    routesMap() {
      let result = createRouteMap(this.menuRoutes);
      return result;
    },
    subRoute() {
      let activeRoute = '';
      const routesMapKey = Object.keys(this.routesMap);
      if (routesMapKey.includes(this.currentPath.first)) {
        return this.routesMap[this.currentPath.first] || {};
      }
      if (this.currentPath && this.currentPath.parentApplication) {
        routesMapKey.forEach(item => {
          if (item.indexOf('/lcms-') > -1 && item.split('-')[1] === this.currentPath.parentApplication) {
            activeRoute = item;
          }
        })
        return this.routesMap[activeRoute] || {};
      }
      return this.routesMap[this.currentPath.first] || {};
    },
    subRouteChildren() {
      let subr = this.subRoute;
      if (!subr) {
        return [];
      }
      let children = subr.children || [];
      return children;
    },
    subRouteTitle() {
      const pathMap = this.subRoute.pathMap || {};
      const item = pathMap[this.$route.path] || {};
      return item.title;
    },
    subRouteEmpty() {
      let children = this.subRoute.children;
      return !children || children.length === 0;
    },
  },
  watch: {
    routePath() {
      const routeCode = this.$route.path && this.$route.path.split('/')[1];
      let routeCodeStatus = routeCode.indexOf('juggle-') > -1;
      this.currentMenu = {
        isThird: routeCodeStatus
      }
      this.path = this.routePath;
    },
    subRouteEmpty() {
      this.$emit('hideRight', this.subRouteEmpty);
    },
    '$i18n.locale'() {
      this.queryMenu()
    },
  },
  methods: {
    handleLogo() {},
    handleSelect(path) {
      this.currentMenu = {}
      this.path = path;
      const firstPath = navigateToFirstChild(this.routesMap[path]);
      if (firstPath) {
        if (window.location.pathname.indexOf('juggle-') > -1) {
          const { isMergeSubMenu, path, redirect } = firstPath;
          const resultPath = isMergeSubMenu ? redirect : path;
          window.location.href = window.location.origin + resultPath
        } else {
          labelManager.routeRedirct(firstPath, 'path')
        }
      }
      this.$emit('customRouteChange');
    },
    queryMenu() {
      if (this.fnMenu) {
        this.fnMenu().then(
          data => {
            const { list, authCodes = [] } = data;
            this.menuList = list;
            this.startQueryMenu = false;
            this.$sysConf.hasMenu = this.menuList.length > 0;

            // 解析一下authCodes数据
            if (authCodes.length) {
              this.$sysConf.authCodes = authCodes.reduce((res, cur) => {
                res[cur] = true;
                return res;
              }, {});
            }
          },
          () => {
            this.menuList = [];
            this.startQueryMenu = false;
          }
        );
      } else {
        this.startQueryMenu = false;
      }
    },
    // 跳转到第三方应用
    handlePathThird(menu) {
      this.currentMenu = menu
      // this.$router.push(`/third-${menu.code}/`)
      this.$router.push(`/juggle-scrm-wxwork-dashoard/`)
      this.$emit('thirdRouteChange', menu);
    }
  },
};

function navigateToFirstChild(item) {
  const { children = [] } = item;
  if (children && children.length) return navigateToFirstChild(children[0]);
  return item;
}

function createRouteMap(routes) {
  return routes.reduce((r, item) => {
    r[item.path] = item;
    return r;
  }, {});
}

// 过滤hidden菜单及菜单排序
function parseRoutes(list, parent = '') {
  return list
    .filter(({ hidden }) => !hidden)
    .sort((a, b) => {
      let asort = a.sort;
      if (asort == undefined) {
        asort = 99999999;
      }
      let bsort = b.sort;
      if (bsort == undefined) {
        bsort = 99999999;
      }
      return asort - bsort;
    })
    .map(data => parseRouteData(data, parent));
}

// eslint-disable-next-line no-unused-vars
function parseRouteData(data, parent = '') {
  let { children, path, sname, icon, ...rest } = data;
  let pathMap = {};
  // 子应用不需要处理
  // if (parent !== '') {
  //   path = `${parent}/${path}`;
  // }
  let title = getTitle(data);
  if (children) {
    children = parseRoutes(children, path);
    pathMap = createRouteMap(children);

    if (!title) {
      title = getTitle(children[0]);
    }
  }

  return { children, pathMap, path, sname, icon, title, ...rest };
}

function getTitle(data = {}) {
  const { meta, sname } = data;
  let title = sname;
  if (!title) {
    if (meta && meta.title) {
      title = meta.title;
    }
  }
  return title;
}

// 解析权限菜单
// function parseMenu(menuList) {
//   return menuList.reduce((res, cur) => {
//     const { code, children, name, sort } = cur;
//     let result = { sort, name };
//     if (children && children.length) {
//       const parseChildren = parseMenu(children);
//       if (Object.keys(parseChildren).length) result.children = parseChildren;
//     }
//     if (code) {
//       res[code] = result;
//     }
//     return res;
//   }, {});
// }

// function filterMenu(routeList, menuMap = {}) {
//   return routeList.filter(item => {
//     let { code, children } = item;
//     const menuItem = menuMap[code];
//     if (menuItem) {
//       const { sort } = menuItem;
//       item.sort = sort;
//       item.sname = menuItem.name;
//       if (children && children.length) {
//         item.children = filterMenu(children, menuItem.children);
//       }
//       return true;
//     }
//     return false;
//   });
// }
</script>
