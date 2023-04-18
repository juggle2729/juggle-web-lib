<template>
  <el-button v-if="hasAuth || showAll" @click="$emit('click')" v-bind="props" :disabled="!hasAuth">
    <slot v-if="$slots.default"></slot>
    <template v-else>{{ title }}</template>
  </el-button>
</template>
<script>
/**
 * @author: xj@xitu.com
 * @date: 2021/04/07
 */
export default {
  emits: ['click'],
  name: 'juggle-button',
  props: {
    // 权限码
    authCode: { type: String, default: '' },
    title: { type: String, default: '' },
    // 按钮的相关属性
    props: { type: Object, default: () => ({}) },
    showAll: { type: Boolean, default: false }
  },
  computed: {
    /* eslint-disable */
    hasAuth() {
      if (process.env.VUE_APP_MENU == 'self') return true;
      if (!this.authCode) return true;
      if (!this.$sysConf.authCodes) return false;
      if (this.authCode) {
        if (this.authCode.includes('||')) {
          const temp = this.authCode.split(' || ');
          if (this.$sysConf.authCodes) {
            const result = temp.some(code => this.$sysConf.authCodes[code]) ? true : false;
            return result;
          }
        }
        if (this.$sysConf.authCodes) {
          let tmp = this.authCode.split(',');
          const result = tmp.every(code => this.$sysConf.authCodes[code]) ? true : false;
          return result;
        }
      }
    },
  },
};
</script>
