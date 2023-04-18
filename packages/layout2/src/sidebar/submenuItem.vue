<template>
  <el-submenu v-if="isSubmenu" class="lts-submenu" ref="submenuRef" :index="itemData.path">
    <template #title>
      <!-- <el-tooltip :show-after="500" effect="dark" :content="itemData.title" placement="right-end"> -->
      <div class="sidebar2__submenu-title">
        <div class="sidebar2__submenu-title__icon">
          <!-- <img v-if="itemData.icon" :src="itemData.icon" alt="" />
          <i v-else class="el-icon-user-solid"></i>-->
          <i :class="itemData.icon || 'el-icon-user-solid'"></i>
        </div>

        <el-tooltip
          :show-after="500"
          :offset="-12"
          effect="ltsstyle"
          :content="itemData.title"
          placement="bottom-start"
        >
          <span class="lts-submenu-title">{{ itemData.title }}</span>
        </el-tooltip>
      </div>
      <!-- </el-tooltip> -->
      <!-- <span>{{ itemData.title }}</span> -->
    </template>
    <submenu-item v-for="data in itemData.children" :itemData="data" :level="level + 1" :key="data.path"></submenu-item>
  </el-submenu>
  <!-- <router-link v-else :to="menuIndex"> -->

  <el-menu-item v-else ref="menuItemRef" :style="styles" :index="menuIndex" @click="gotoApplication(menuIndex)">
    <template #title>
      <!-- <img v-if="itemData.icon" :src="itemData.icon" alt="" />
      <i v-else class="el-icon-user-solid"></i>-->
      <div class="lts-submenu-title-x" :class="itemCls">
        <i class="noSubmenu" :class="itemData.icon" v-if="itemData.icon"></i>
        <el-tooltip
          :show-after="500"
          :offset="-12"
          effect="ltsstyle"
          :content="itemData.title"
          placement="bottom-start"
        >
          <span class="lts-submenu-title">{{ itemData.title }}</span>
        </el-tooltip>
      </div>
    </template>
  </el-menu-item>
  <!-- </router-link> -->
</template>

<script>
import { computed } from 'vue';
import labelManager from '../labelManager';
export default {
  name: 'submenu-item',
  inject: ['rootLayout'],
  props: {
    itemData: { type: Object },
    level: { type: Number },
  },
  computed: {
    itemCls() {
      return `level-${this.level}`;
    },
    styles() {
      if (this.level == 0) {
        return { paddingLeft: '0px !important' };
      }
      return '';
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
  methods: {
    onMenuSelect(itemData) {
      this.rootLayout.navTo(itemData);
    },
    gotoApplication(path) {
      if (path.indexOf('user_service_group') > -1) {
        if (path.indexOf('service_group_management') > -1) {
          this.goImTeamsRedirect(0);
        } else {
          this.goImTeamsRedirect(1);
        }
        return;
      }
      if (path === labelManager?.activeLabelItemRef?.value?.path) {
        return;
      }
      if (labelManager.routeRedirct) {
        labelManager.routeRedirct(path, 'MENU');
      } else {
        window.location.href = path;
      }
    },
    // 创建超链接，不会被拦截
    createSuperLabel(url, id) {
      let a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.setAttribute('id', id);
      // 防止反复添加
      if (!document.getElementById(id)) {
        document.body.appendChild(a);
      }
      a.click();
    },
    goImTeamsRedirect(type) {
      const userId = window.localStorage.getItem('userId');
      const userName = window.localStorage.getItem('userName');
      const phone = window.localStorage.getItem('phone');
      // const authorization = window.localStorage.getItem('Authorization');
      this.$apis.common
        .getTeamsRedirect({
          type,
        })
        .then(res => {
          const id = 'new_a';
          this.createSuperLabel(
            `${res?.redirectTo}?userId=${userId}&userName=${userName}&phone=${phone}&authorization=${res?.token}`,
            id
          );
        });
    },
  },
};
</script>
