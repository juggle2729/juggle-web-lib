<template>
  <div :class="['sidebar-sub', { 'sidebar-sub--hide': !rootLayout.isExpand }]">
    <!-- <div class="sidebar-sub__title">title</div> -->
    <scroll-bar>
      <el-menu
        mode="vertical"
        unique-opened
        ref="menuRef"
        :default-active="routePath"
        background-color="#062E28"
        text-color="#9BABA9"
        active-text-color="#fff"
      >
        <submenu-item
          v-for="route in menus"
          :itemData="route"
          :level="0"
          :key="route.path"
          :index="route.path"
        ></submenu-item>
      </el-menu>
    </scroll-bar>
  </div>
</template>

<script>
import scrollBar from './scrollbar.vue';
import submenuItem from './submenuItem.vue';
import labelManager from '../labelManager';

export default {
  components: { scrollBar, submenuItem },
  props: {
    menus: { type: Array, default: () => [] },
  },
  inject: ['rootLayout'],
  computed: {
    routePath() {
      let activeLabelItem = this.$route;
      if (labelManager.activeLabelItemRef.value) {
        activeLabelItem = labelManager.activeLabelItemRef.value;
      }

      let path = activeLabelItem.path;
      return path;
    },
  },
  mounted() {
    // if (this.$refs.menuRef) {
    //   this.$refs.menuRef.hoverBackground = 'rgba(13, 99, 86, 0.35)';
    // }
  },
};
</script>

<style></style>
