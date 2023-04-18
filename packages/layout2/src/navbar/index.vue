<template>
  <div class="navbar2" v-resize="onResize">
    <div :class="['navbar2__content', { 'navbar2__content--fold': !rootLayout.isExpand }]">
      <!-- 列表 -->
      <div class="navbar2__label-item-list">
        <label-item
          v-for="item in labelListShow"
          :labelData="item"
          :key="item.path"
          @select="onItemSelect"
          @delete="onItemDelete"
        ></label-item>
      </div>

      <div :class="['navbar2__content__placeholder', { 'navbar2__content__placeholder--last': isLast }]">
        <el-dropdown trigger="click" @command="onItemSelect" ref="dropdownRef">
          <div v-show="isSelectMoreShow" class="navbar2__select-more"><i class="el-icon-caret-bottom"></i></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in labelSelectMoreList" :command="item" :key="item.path">
                <dropItem :item="item" @remove="onItemRemove"></dropItem>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="navbar2__placeholder"></div>
  </div>
</template>

<script>
import { isTypePromise } from '../../../../utils/base';
import { handleConfirm, handleMessage } from '../../../../utils/common';
import labelItem from './labelItem.vue';
import labelManager from '../labelManager';
import dropItem from './dropItem.vue';

export default {
  components: { labelItem, dropItem },
  inject: ['rootLayout'],
  data() {
    return {
      // path: '/',
      nickName: '',

      // navbarWidth: -1,
      dropStyle: {
        minWidth: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    };
  },
  computed: {
    labelList() {
      let result = labelManager.labelList.value.filter(item => item.isShow);
      // 处理一下数据
      result = result.map(item => {
        if (!item.title) {
          let routeData = this.rootLayout.routesPathMap[item.routeDataPath];
          item.routeData = routeData;
          item.title = (routeData && routeData.sname) || (item.meta && item.meta.title) || '';
        }
        const title = this.routesPathTitleMap?.[item.routeDataPath];
        item.title = title || item.title;
        return item;
      });

      return result;
    },
    labelListShow() {
      let showSize = labelManager.currentShowSizeRef.value;
      let result = this.labelList;
      if (showSize > 0) {
        result = result.slice(0, showSize);
      }
      return result;
    },
    isSelectMoreShow() {
      let showSize = labelManager.currentShowSizeRef.value;
      if (showSize < 0) return false;
      return showSize < this.labelList.length;
    },
    labelSelectMoreList() {
      let result = [];
      let showSize = labelManager.currentShowSizeRef.value;
      if (showSize > 0) {
        result = this.labelList.slice(showSize);
      }
      return result;
    },
    isLast() {
      let lastItem = this.labelListShow[this.labelListShow.length - 1];
      return lastItem == labelManager.activeLabelItemRef.value;
    },
    routesPathTitleMap() {
      const mapObj = this.rootLayout?.routesPathMap || {};
      const titleMap = {};
      Object.keys(mapObj)?.forEach(item => {
        titleMap[item] = mapObj[item].meta.title || '';
      })
      return titleMap;
    },
  },
  mounted() {
    this.nickName = sessionStorage.getItem('user');
  },
  methods: {
    onResize(width) {
      labelManager.setNavbarWidth(parseInt(width));
      // this.navbarWidth = parseInt(width);
      // console.log('resize', width);
      //  更新列表选中项的索引
      // labelManager.updateListActiveIndex(this.labelListShowSize);
    },
    // onDropdownClick(data) {
    //   console.log('data', data);
    // },
    handleSelect(path) {
      this.$emit('pathChange', path);
    },
    logout() {
      this.$emit('logout');
    },
    onItemSelect(labelItem) {
      // const { path, query = {}, params = {} } = labelItem.labelRouteData;
      // this.$router.push({ path, query, params });
      labelManager.routeRedirct(labelItem);

      // console.log('on item select')
    },
    onItemRemove() {
      if (this.labelSelectMoreList.length) return;
      this.$refs.dropdownRef.visible = false;
    },
    onItemDelete(labelItem) {
      const currentInstance = this.getCurrentInstance();
      let isFormChange = false,
        params,
        save;
      if (currentInstance?.labelDelete) [isFormChange, params, save] = currentInstance.labelDelete();
      if (isFormChange) {
        handleConfirm('有未保存的内容，是否保存？', 'warning', '提示', false, '保存', '退出')
          .then(() => {
            if (!params) {
              handleMessage('必填项未完成', 'error', false);
              return;
            }
            save(params);
          })
          .catch(() => {
            this.handleItemDelete(currentInstance, labelItem);
          });
        return;
      }
      this.handleItemDelete(currentInstance, labelItem);
    },
    handleItemDelete(currentInstance, labelItem) {
      if (labelManager.isCurrentLabel(labelItem)) {
        // 当前选中的label
        if (currentInstance && currentInstance.beforeCloseLabelItem) {
          const next = () => {
            labelManager.removeItem(labelItem);
          };
          let result = currentInstance.beforeCloseLabelItem(next);
          if (isTypePromise(result)) {
            result.then(res => {
              res === true && labelManager.removeItem(labelItem);
            });
          }
          if (result !== true) return;
        }
      } else {
        labelManager.emitRemoveItem(labelItem);
      }
      labelManager.removeItem(labelItem);
    },
    getCurrentInstance() {
      let { matched } = this.$route;
      let last = matched[matched.length - 1];
      if (last) {
        return last.instances.default;
      }
    },
  },
};
</script>
