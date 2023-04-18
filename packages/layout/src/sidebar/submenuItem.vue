<template>
  <el-submenu v-if="isSubmenu" :index="itemData.path">
    <template #title>
      <span :style="styles">{{ itemData.title }}</span>
    </template>
    <submenu-item v-for="data in itemData.children" :itemData="data" :level="level + 1" :key="data.path"></submenu-item>
  </el-submenu>
  <router-link v-else :to="itemData.path">
    <el-menu-item :index="menuIndex">
      <template #title>
        <span :style="styles">{{ itemData.title }}</span>
      </template>
    </el-menu-item>
  </router-link>
</template>

<script>
import { computed } from 'vue';
export default {
  name: 'submenu-item',
  props: {
    itemData: { type: Object },
    level: { type: Number },
  },
  computed: {
    styles() {
      return `padding-left: ${this.level * 10}px`;
    },
  },
  setup(props) {
    const isSubmenu = computed(() => {
      let result = !props.itemData.isMergeSubMenu && props.itemData.children;
      return result;
    });
    const menuIndex = computed(() => {
      let result = props.itemData.path;
      if (props.itemData.isMergeSubMenu) {
        result = props.itemData.redirect;
      }
      return result;
    });
    return { isSubmenu, menuIndex };
  },
};
</script>

