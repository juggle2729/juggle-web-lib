<template>
  <div class="bread-crumb">
    <el-breadcrumb class="app-breadcrumb" separator="/">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
          <span v-if="item.redirect === 'noredirect' || index == levelList.length - 1">
            {{ item.title }}
          </span>
          <router-link class="redirect" v-else :to="item.redirect || item.path">{{ item.title }}</router-link>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  props: {
    routesPathMap: { type: Object, default: () => ({}) },
  },
  data() {
    return { levelList: null };
  },
  computed: {},
  watch: {
    $route() {
      this.getBreadcrumb();
    },
  },
  created() {
    this.getBreadcrumb();
  },
  methods: {
    getBreadcrumb() {
      let matchRoutes = this.$route.matched.filter(item => item.meta.title);
      let isMergeSubMenuIndex = matchRoutes.findIndex(item => item.meta.isMergeSubMenu);
      if (isMergeSubMenuIndex >= 0) {
        let nextItem = matchRoutes[isMergeSubMenuIndex + 1];
        if (nextItem && nextItem.meta.hidden) {
          // 不处理
        } else {
          matchRoutes = matchRoutes.slice(0, isMergeSubMenuIndex + 1);
        }
      }
      // 处理title
      matchRoutes = matchRoutes.map(item => {
        const { redirect, path, meta } = item;
        let tmp = this.routesPathMap[path];
        let title = meta.title;
        if (tmp) title = tmp.sname;
        return { redirect, path, title };
      });
      this.levelList = matchRoutes;
    },
  },
};
</script>

<style lang="less" scoped>
.app-breadcrumb {
  flex: 1;
  &.el-breadcrumb {
    display: inline-block;
    font-size: 14px;
    // line-height: 70px;
    margin-left: 10px;
    .redirect {
      font-weight: 400;
      color: rgba(0, 0, 0, 0.45);
      // cursor: text;
      &:hover {
        color: #409eff;
      }
    }
  }
}
</style>
