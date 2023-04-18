<script>
export default {
  name: 'juggle-auth-container',
  props: {
    // 权限码
    authCode: { type: String, default: '' },
    showAll: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /* eslint-disable */
    hasAuth() {
      if (process.env.VUE_APP_MENU == 'self') return true;
      if (!this.authCode) return true;
      if (!this.$sysConf.authCodes) return false;
      return this.$sysConf.authCodes[this.authCode];
    },
  },
  render(){
    return  (this.hasAuth || this.showAll)? this.$slots.default() : '';
  }
};
</script>
