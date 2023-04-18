<template>
  <el-button v-bind="bindProps" @click="$emit('b-click')">
    {{ iconSuffix ? text : '' }}
    <i v-if="btnData?.icon" :class="{ [`el-icon-${btnData.icon}`]: true }"></i>
    <slot name="icon"></slot>
    {{ iconSuffix ? '' : text }}
  </el-button>
</template>
<script>
export default {
  props: {
    btnData: { type: Object, default: () => {} },
    btnText: { type: String, default: '' },
    isSearch: Boolean,
  },
  computed: {
    // 绑定属性
    bindProps() {
      let obj = {
        text: this.text,
        type: this.isSearch ? 'primary' : 'default',
        size: 'mini',
        iconPos: 'prefix',
        ...this.btnData,
      };
      delete obj.text;
      delete obj.iconPos;
      return obj;
    },
    text() {
      return this.btnData?.text ? this.btnData.text : this.btnText;
    },
    iconSuffix() {
      return this.btnData?.iconPos === 'suffix';
    },
  },
};
</script>
