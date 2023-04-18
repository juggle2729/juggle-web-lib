<template>
  <div v-show="isDetailPage" class="detail-header">
    <svg @click="onBack" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.4999 4L3 7L6.4999 10.5"
        stroke="#333333"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M3 7H14.4969C17.9384 7 20.861 9.8102 20.9952 13.25C21.1369 16.8848 18.1335 20 14.4969 20H5.9992"
        stroke="#333333"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span>{{ title }}</span>
  </div>
</template>

<script>
import { isTypePromise } from '../../../utils/base';

import labelManager from './labelManager';
export default {
  computed: {
    /**
     * 是否为详情页
     */
    isDetailPage() {
      let currentShowSizeRef = labelManager.labelList.value;
      if (!labelManager.activeLabelItemRef.value) {
        currentShowSizeRef.forEach(item => {
          if (item.path === this.$route.path) {
            labelManager.activeLabelItemRef.value = item;
          } else {
            item.subpathList.forEach(one => {
              if (one.path === this.$route.path) {
                labelManager.activeLabelItemRef.value = item;
              }
            })
          }
        });
      }

      let result = false;
      let activeLabelItem = labelManager.activeLabelItemRef.value;
      let length = activeLabelItem?.subpathList?.length;
      if (length && this.$route.path === activeLabelItem?.subpathList[length - 1]?.path) {
        result = true;
        const routeMeta = activeLabelItem?.subpathList[length - 1]?.meta;
        if (routeMeta) {
          if (routeMeta.hidden) result = routeMeta.hidden;
          if (typeof routeMeta.isDetailPage === 'boolean') result = routeMeta.isDetailPage;
        }
      }
      let meta = this.$route.meta;
      if (meta.hidden) result = meta.hidden;
      if (typeof meta.isDetailPage === 'boolean') result = meta.isDetailPage;
      return result;
    },
    title() {
      let result = '详情';
      let activeLabelItem = labelManager.activeLabelItemRef.value;
      let length = activeLabelItem?.subpathList.length;
      if (length && this.$route.path === activeLabelItem?.subpathList[length - 1]?.path) {
        let { meta } = activeLabelItem.subpathList[length - 1];
        if (meta.i18nTitle != null) {
          return this.$t(meta.i18nTitle);
        }
        if (meta.title != null) result = meta.title;
      }


      // let { meta } = this.$route;
      // if (meta.i18nTitle != null) {
      //   return this.$t(meta.i18nTitle);
      // }
      // if (meta.title != null) result = meta.title;
      return result;
    },
  },
  methods: {
    onBack() {
      // 当前选中的label
      let currentInstance = this.getCurrentInstance();
      if (currentInstance && currentInstance.beforeDetailBack) {
        const next = () => {
          labelManager.back();
        };
        let result = currentInstance.beforeDetailBack(next);
        if (isTypePromise(result)) {
          result.then(res => {
            res === true && labelManager.back();
          });
        }
        if (result !== true) return;
      }

      labelManager.back();
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

<style lang="less" scoped>
.detail-header {
  padding: 0 20px;

  height: 50px;
  line-height: 50px;

  background: #efefef;
  border-radius: 4px 4px 0 0;

  font-weight: 500;
  font-size: 18px;
  color: #303133;

  display: flex;
  align-items: center;

  & > svg {
    cursor: pointer;
  }

  & > span {
    padding-left: 10px;
  }
}
</style>
