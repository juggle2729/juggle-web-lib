<template>
  <div class="app-wrapper">
    <sidebar ref="sidebarRef" :title="title" :fnMenu="fnMenu" @routeChange="onRouteChange"> </sidebar>
    <div class="main-container">
      <navbar
        :isSubMenuEmpty="isSubMenuEmpty"
        :menuList="parseRoutes"
        @pathChange="onPathChange"
        @logout="$emit('logout')"
      >
        <slot name="navBar"></slot>
      </navbar>
      <breadcrumb :routesPathMap="routesPathMap"></breadcrumb>
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
import './index.less';
import navbar from './navbar.vue';
import sidebar from './sidebar/index.vue';
import breadcrumb from './breadcrumb.vue';

import appMain from './appMain.vue';

export default {
  name: 'juggle-layout',
  components: { navbar, sidebar, breadcrumb, appMain },
  data() {
    return {
      isSubMenuEmpty: true,
      isHide: true,
      parseRoutes: [],
      routesPathMap: {},
    };
  },
  props: {
    title: { type: String, default: '人' },
    fnMenu: { type: Function, default: null },
  },
  methods: {
    onRouteChange(routes) {
      this.parseRoutes = routes.map(({ path, sname, meta }) => {
        if (!sname) sname = meta.title;
        return { path, title: sname };
      });
      this.routesPathMap = getRoutesData(routes);
    },
    onPathChange(path) {
      if (this.$refs.sidebarRef) {
        this.$refs.sidebarRef.handleSelect(path);
      }
    },
  },
};

function getRoutesData(routes, trans = {}) {
  let result = routes.reduce((res, cur) => {
    let { path, children, sname, meta } = cur;
    if (!sname) sname = meta.title;
    res[path] = { sname };

    if (children) getRoutesData(children, res);

    return res;
  }, trans);

  return result;
}
</script>

<style lang="less" scoped>
.app-wrapper {
  position: relative;
  // height: 100%;
  width: 100%;
  min-height: 100vh;
  background-color: #f2f2f2;
}
</style>
