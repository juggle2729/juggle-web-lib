<template>
  <div
    :class="[
      'label-item',
      {
        'label-item--home': isHome,
        'label-item--active': isActive,
        'label-item--pre': isPre,
      },
    ]"
    @click="onSelect"
  >
    <div v-show="isActive" class="label-item--line"></div>
    <div class="label-item__content" v-if="!isHome">
      <span>{{ labelData.meta && labelData.meta.i18nTitle ? $t(labelData.meta.i18nTitle) : labelData.title }}</span>
      <i class="el-icon-close" @click.stop="onDelete"></i>
    </div>
    <!-- <i v-else class="el-icon-s-home"></i> -->
    <i v-else class="iconfont icon-home"></i>
    <div v-show="borderVisible" class="label-item--border"></div>
  </div>
</template>

<script>
import labelManager from '../labelManager';
export default {
  emits: ['select', 'delete'],
  inject: ['rootLayout'],
  props: {
    labelData: { type: Object },
  },
  computed: {
    isHome() {
      return this.labelData.isHome;
    },
    isPre() {
      let active = labelManager.activeLabelItemRef.value;
      // console.log('active', active)
      return labelManager.isLabelEqual(this.labelData, active?.preNode);
    },
    // isNext() {
    //   let active = labelManager.activeLabelItemRef.value;
    //   return this.labelData == active.nextNode;
    // },
    isActive() {
      // console.log('是否被选择', labelManager.isActive(this.labelData))
      // console.log('是否被选择', this.labelData)
      // console.log('labelManager.activeLabelItemRef.value', labelManager.activeLabelItemRef.value)
      let currentActive = false;
      let length = this.labelData?.subpathList.length;
      if (length && this.$route.path === this.labelData?.subpathList[length - 1]?.path) {
        // labelManager.activeLabelItemRef.value = this.labelData;
        currentActive = true;
      } else {
        currentActive = labelManager.isActive(this.labelData);
      }
      return currentActive;
      // return this.labelData == labelManager.activeLabelItemRef.value;
    },
    borderVisible() {
      return !(this.isActive || this.isPre);
    },
    // routeData() {
    //   return this.rootLayout.routesPathMap[this.labelData.routeDataPath];
    // },
    // title() {
    //   return this.routeData.sname;
    // },
  },
  methods: {
    onSelect() {
      if (this.isActive) return;
      this.$emit('select', this.labelData);
    },
    onDelete() {
      this.$emit('delete', this.labelData);
    },
  },
};
</script>

<style lang="less" scoped>
@width: 140px;
@height: 40px;
@gap: 8px;

.label-item {
  position: relative;
  z-index: 1;
  // margin: 4px;
  // border: 1px solid #ddd;
  width: @width;
  height: @height;
  padding: 0 12px;

  background-color: #fff;
  transition: background-color 0.3s;

  font-size: 14px;
  line-height: 20px;

  color: #606266;
  cursor: pointer;

  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.08);

  flex-shrink: 0;

  &--home {
    width: 48px;
    line-height: @height;
    text-align: center;
    .icon-home {
      font-size: 20px;
    }
  }

  &--pre {
    border-bottom-right-radius: 4px;
  }
  // &--next {
  //   border-bottom-left-radius: 4px;
  // }

  &--active {
    z-index: 0;

    font-weight: 500;
    color: #303133;

    background-color: #f9f9f9;
    box-shadow: none;

    // border-left: 1px solid #e8e8e8;
    // border-right: 1px solid #e8e8e8;
    & + div {
      border-bottom-left-radius: 4px;
    }
  }

  &--border {
    position: absolute;
    height: 34px;
    // width: 100%;
    width: 1px;
    background-color: #e8e8e8;
    // left: 0;
    right: 0;
    top: 3px;
  }

  &--line {
    position: absolute;
    height: 4px;
    width: 100%;
    background-color: #18b8a0;
    left: 0;
    top: 0;
  }

  &--mask-bottom {
    position: absolute;
    height: 4px;
    width: 100%;
    background-color: #f9f9f9;
    left: 0;
    bottom: -4px;
  }

  &__content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-icon-close {
      padding: 4px;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.4);
      }
    }

    & > span {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }
}
</style>
