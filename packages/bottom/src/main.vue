<template>
  <div class="juggle-bottom">
    <div
      class="juggle-shadow"
      :class="['juggle-bottom-content', { 'juggle-bottom-content--show': isShow }]"
      :style="propsStyle"
    >
      <slot></slot>
    </div>
    <div class="juggle-bottom-placeholder" :style="propsStyle"></div>
  </div>
</template>

<script>
/**
 * @author: xj@xitu.com
 * @date: 2020-04-08
 */
export default {
  name: 'juggle-bottom',
  data() {
    return {
      isShow: false,
    };
  },
  props: {
    height: { type: String, default: '' },
    backgroundColor: { type: String, default: '#fff' },
    hide: { type: Boolean, default: false },
  },
  computed: {
    contentCls() {
      return {};
    },
    propsStyle() {
      return {
        height: this.height,
        lineHeight: this.height,
        backgroundColor: this.backgroundColor,
      };
    },
  },
  created() {
    setTimeout(() => {
      this.isShow = !this.hide;
    }, 200);
  },
  watch: {
    hide() {
      this.checkHide();
    },
  },
  methods: {
    checkHide() {
      this.isShow = !this.hide;
    },
  },
};
</script>
<style lang="less">
@height: 50px;
.juggle-bottom {
  background: #f2f2f2;
  .juggle-bottom-content {
    position: fixed;
    bottom: 0;
    left: 140px;
    right: 0;
    z-index: 999;
    min-height: @height;
    line-height: @height;
    background-color: white;

    padding: 0 20px;
    opacity: 0;
    transform: translateY(100%);
  }
  .juggle-bottom-content--show {
    transition: all 0.2s ease-in;
    transform: translateY(0);
    opacity: 1;
  }
}
.juggle-bottom-placeholder {
  height: @height;
}
</style>
