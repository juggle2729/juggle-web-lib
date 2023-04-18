<template>
  <div class="sidebar-container">
    <div class="left">
      <router-link to="/home" class="logo">
        <span class="icon">{{ title }}</span>
      </router-link>
      <scroll-bar>
        <el-menu
          mode="vertical"
          :show-timeout="200"
          :default-active="routePath"
          :disabled="false"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#313131"
        >
          <submenu-item
            v-for="route in subRouteChildren"
            :itemData="route"
            :level="0"
            :key="route.path"
            :index="route.path"
          ></submenu-item>
        </el-menu>
      </scroll-bar>
    </div>
  </div>
</template>

<script>
import scrollBar from './scrollbar.vue';
import submenuItem from './submenuItem.vue';

export default {
  components: { scrollBar, submenuItem },
  data() {
    return {
      startQueryMenu: true,
      path: '/',
      menuList: null,
    };
  },
  created() {
    this.startQueryMenu = true;
    this.path = this.$route.path;
    this.queryMenu();
  },
  props: {
    title: { type: String, default: '' },
    fnMenu: { type: Function, default: null },
  },
  computed: {
    routePath() {
      return this.$route.path;
    },
    currentPath() {
      const [, first, ...rest] = this.path.split('/');
      const result = { first: `/${first}`, second: `/${rest.join('/')}` };
      return result;
    },
    menuRoutes() {
      if (this.startQueryMenu) return [];

      let r = this.$router.options.routes;
      r = r.map(item => {
        const { children = [], ...rest } = item;
        rest.children = children.slice();
        return rest;
      });

      if (this.menuList) {
        // 过滤出有权限的菜单
        const menuMap = parseMenu(this.menuList);
        r = filterMenu(r, menuMap);
      }
      let result = parseRoutes(r);
      this.$emit('routeChange', result);
      return result;
    },
    routesMap() {
      return createRouteMap(this.menuRoutes);
    },
    subRoute() {
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
      this.path = this.routePath;
    },
    subRouteEmpty() {
      this.$emit('hideRight', this.subRouteEmpty);
    },
  },
  methods: {
    handleLogo() {},
    handleSelect(path) {
      this.path = path;
      const firstPath = navigateToFirstChild(this.routesMap[path]);
      if (firstPath) this.$router.push({ path: firstPath });
    },
    queryMenu() {
      if (process.env.VUE_APP_MENU == 'self') {
        this.startQueryMenu = false;
        return;
      }
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
  },
};

function navigateToFirstChild(item) {
  const { children = [], path } = item;
  if (children.length) return navigateToFirstChild(children[0]);
  return path;
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

function parseRouteData(data, parent = '') {
  let { children, path, sname, icon, ...rest } = data;
  let pathMap = {};
  if (parent !== '') {
    path = `${parent}/${path}`;
  }
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
function parseMenu(menuList) {
  return menuList.reduce((res, cur) => {
    const { code, children, name, sort } = cur;
    let result = { sort, name };
    if (children && children.length) {
      const parseChildren = parseMenu(children);
      if (Object.keys(parseChildren).length) result.children = parseChildren;
    }
    if (code) {
      res[code] = result;
    }
    return res;
  }, {});
}

function filterMenu(routeList, menuMap = {}) {
  return routeList.filter(item => {
    let { code, children } = item;
    const menuItem = menuMap[code];
    if (menuItem) {
      const { sort } = menuItem;
      item.sort = sort;
      item.sname = menuItem.name;
      if (children && children.length) {
        item.children = filterMenu(children, menuItem.children);
      }
      return true;
    }
    return false;
  });
}
</script>
