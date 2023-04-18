<template>
  <div class="navbar">
    <el-menu :default-active="currentPath.first" mode="horizontal" @select="handleSelect">
      <!-- background-color="#545c64"
      text-color="#fff"
      active-text-color="#fff" -->
      <el-menu-item v-for="menu in menuList" :index="menu.path" :key="menu.path">{{ menu.title }}</el-menu-item>
    </el-menu>
    <div class="set-up">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    menuList: { type: Array, default: () => [] },
  },
  data() {
    return {
      // path: '/',
      nickName: '',
    };
  },
  computed: {
    currentPath() {
      const [, first, ...rest] = this.$route.path.split('/');
      const result = { first: `/${first}`, second: `/${rest.join('/')}` };
      return result;
    },
  },
  // created() {
  //   this.path = this.$route.path;
  // },

  mounted() {
    this.nickName = sessionStorage.getItem('user');
  },
  methods: {
    handleSelect(path) {
      this.$emit('pathChange', path);
    },
    logout() {
      this.$emit('logout');
    },
  },
};
</script>
<style lang="less" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  .set-up{
    display: flex;
    align-items: center;
    margin-right:15px;
  }
}
</style>
