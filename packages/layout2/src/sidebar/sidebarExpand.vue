<template>
  <div :class="['sidebar-expand', { 'sidebar-expand--fold': !rootLayout.isExpand }]" @click="onClick">
    <div class="sidebar-expand__triggle"></div>
    <i class="el-icon-caret-left"></i>
  </div>
</template>

<script>
export default {
  inject: ['rootLayout'],
  methods: {
    onClick() {
      this.rootLayout.isExpand = !this.rootLayout.isExpand;
      localStorage.setItem('isExpand', this.rootLayout.isExpand)
    },
  },
};
</script>
