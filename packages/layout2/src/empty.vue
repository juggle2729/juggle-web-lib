<template>
 <!-- <router-view v-if="!useKeepAlive"></router-view> -->
  <router-view v-slot="{ Component }">
    <keep-alive :include="include">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script>
import { isKeepAlive } from './utils.js';
export default {
  name: 'juggleLayoutEmpty',
  computed: {
    include() {
      // let result = this.$labelManager.keepAliveIncludes.value;
      // console.log('include value', result);
      return this.keepList || [];
    },
    // 使用 keep-alive
    useKeepAlive() {
      return isKeepAlive(this.$route.meta);
    },
  },
  data() {
    return {
      keepList: [],
    };
  },
  created() {
    this.keepList = this.$labelManager.keepAliveIncludes.value;
    this.$labelManager.keepAliveIncludesNood = list => {
      this.keepList = list;
    };
  },
  mounted() {
    // 解析一下authCodes数据
    if (!this.$sysConf.authCodes && window?.authCodes?.length ) {
      this.$sysConf.authCodes = window.authCodes.reduce((res, cur) => {
        res[cur] = true;
        return res;
      }, {});
    }
  }
};
</script>
