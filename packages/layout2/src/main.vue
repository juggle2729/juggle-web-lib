<template>
  <div class="app-wrapper">
    <sidebar ref="sidebarRef" :allMenulist="allMenulist" :fnMenu="fnMenu" @routeChange="onRouteChange" @thirdRouteChange="onThirdRouteChange" @customRouteChange="onCustomRouteChange">
      <slot name="navBar"></slot>
    </sidebar>
    <div :class="['main-container2', { 'main-container2--fold': !isExpand, 'main-container2-third': thirdMenu.isThird }]">
      <navbar ref="navbarRef" v-if="!thirdMenu.isThird"></navbar>
      <!-- <breadcrumb :routesPathMap="routesPathMap"></breadcrumb> -->
      <div class="main-content">
        <detail-header></detail-header>
        <slot name="loadingEmpty"></slot>
        <slot name="childProject"></slot>
        <empty></empty>
      </div>
    </div>
    <slot name="floatingBall"></slot>
  </div>
</template>

<script>
import './index.less';
import navbar from './navbar/index.vue';
import sidebar from './sidebar/index.vue';
import detailHeader from './detailHeader.vue';
import empty from './empty.vue';

export default {
  name: 'juggle-layout2',
  components: { navbar, sidebar, detailHeader, empty },
  data() {
    return {
      // 是否展开
      isExpand: true,
      parseRoutes: [],
      routesPathMap: {},
      thirdMenu: {} // 第三方路由
    };
  },
  provide() {
    return {
      rootLayout: this,
    };
  },
  props: {
    allMenulist: { type: Array, default: null },
    fnMenu: { type: Function, default: null },
  },
  watch: {
    '$route': {
      handler: function(val) {
        const routeCode = val && val.path.split('/')[1];
        let routeCodeStatus = routeCode.indexOf('juggle-') > -1;
        this.thirdMenu = {
          isThird: routeCodeStatus
        }
      },
      immediate: true
    }
  },
  created() {
    localStorage.setItem('isExpand', true)
  },
  methods: {
    navTo(routeData) {
      if (this.$refs.navbarRef) {
        this.$refs.navbarRef.navTo(routeData, 'menu');
      }
    },
    onRouteChange(routes) {
      this.routesPathMap = getRoutesData(routes);
    },
    onThirdRouteChange(menu) {
      this.thirdMenu = menu
    },
    onCustomRouteChange() {
      this.thirdMenu = {}
    }
  },
};

function getRoutesData(routes, trans = {}) {
  let result = routes.reduce((res, cur) => {
    let { path, children, sname, meta } = cur;
    if (!sname) sname = meta.title || '';
    res[path] = { sname, path, meta };

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
  background-color: #f9f9f9;

  font-family: PingFang SC;
  font-style: normal;
  font-weight: normal;
}
.main-container2-third {
  margin-left: 50px;
}
</style>
