<template>
  <div class="sidebar-main">
    <div class="sidebar-main__logo">
      <img :src="require('./image/logo.png')" alt="" />
    </div>
    <div class="sidebar-main__menu-list">
      <el-menu
        ref="menuRef"
        background-color="#062E28"
        text-color="#9BABA9"
        active-text-color="#fff"
        :default-active="routePath"
        :collapse="!rootLayout.isExpand"
      >
        <el-submenu v-for="menu in menus" :index="menu.path" :key="menu.path">
          <template #title>
            <el-tooltip :show-after="500" :offset="-12" effect="ltsstyle" :content="menu.title" placement="bottom-start">
              <div
                :class="['sidebar-main__item', { 'sidebar-main__item--active': activeLabel == menu.path }]"
                @click="handleSelect(menu)"
              >
                <div class="sidebar-main__item__icon">
                  <!-- <img v-if="menu.icon" :src="menu.icon" alt="" /> -->
                  <!-- <i v-else class="el-icon-user-solid"></i> -->
                  <i :class="menu.icon || 'el-icon-user-solid'"></i>
                </div>
                <span class="lts-sidebar-main-title">{{ menu.title }}</span>
              </div>
            </el-tooltip>
          </template>
          <template v-if="!rootLayout.isExpand">
            <submenu-item v-for="data in menu.children" :itemData="data" :level="0" :key="data.path"></submenu-item>
          </template>
        </el-submenu>
      </el-menu>
    </div>
    <div class="sidebar-main__slot">
      <slot></slot>
    </div>
    <!-- </scroll-bar> -->
  </div>
</template>

<script>
// import scrollBar from './scrollbar';
import submenuItem from './submenuItem.vue';
import labelManager from '../labelManager';

export default {
  components: { submenuItem },
  emits: ['pathChange'],
  inject: ['rootLayout'],
  props: {
    currentPath: { type: Object, default: () => ({}) },
    menus: { type: Array, default: () => [] },
  },
  computed: {
    routePath() {
      if (this.rootLayout.isExpand) {
        return this.currentPath.first;
      }

      let activeLabelItem = this.$route;
      if (labelManager.activeLabelItemRef.value) {
        activeLabelItem = labelManager.activeLabelItemRef.value;
      }

      let path = activeLabelItem.path;
      return path;
    },
    menuMain() {
      return this.menus.map(({ path, sname, meta }) => {
        if (!sname) sname = meta.title;
        return { path, title: sname };
      });
    },
    activeLabel() {
      if (
        this.currentPath.first.indexOf('/lcms-') > -1 &&
        this.currentPath.first.split('-')[1] !== this.currentPath.parentApplication
      ) {
        return this.currentPath.first.split('-')[0] + '-' + this.currentPath.parentApplication;
      }
      return this.currentPath.first;
    },
  },
  mounted() {
    // if (this.$refs.menuRef) {
    //   this.$refs.menuRef.hoverBackground = 'rgba(13, 99, 86, 0.35)';
    // }
  },
  methods: {
    handleSelect(path) {
      if (path.isThird) {
        setTimeout(() => {
          this.$emit('pathThird', path);
        }, 0);
      } else {
        setTimeout(() => {
          this.$emit('pathChange', path.path);
        }, 0);
      }
    },
  },
};
</script>

<style></style>
