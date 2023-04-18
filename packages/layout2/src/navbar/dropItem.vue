<template>
  <div class="drop-item">
    <span>{{ item.title }}</span>
    <i class="el-icon-close" style="margin-right: 0" @click.stop="onDelete(item)"></i>
  </div>
</template>

<script>
import labelManager from '../labelManager';

export default {
  props: {
    item: { type: Object, default: () => ({}) },
  },
  methods: {
    onDelete(labelItem) {
      labelManager.removeItem(labelItem);
      this.$emit('remove');
    },
  },
};
</script>

<style lang="less" scoped>
.drop-item {
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    .el-icon-close {
      opacity: 1;
      transform: scale(1.4);
    }
  }

  .el-icon-close {
    padding: 4px;
    transition: all 0.3s;
    opacity: 0;
  }
}
</style>
