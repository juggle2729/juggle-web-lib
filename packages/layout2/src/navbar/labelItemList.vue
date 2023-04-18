<template>
  <div class="label-item-list"></div>
</template>

<script>
import labelItem from './labelItem.vue';
export default {
  components: { labelItem },
  props: {
    labelList: { type: Array, default: () => [] },
  },
};
</script>
<style lang="less" scoped>
.label-item-list {
  height: 100%;
  display: flex;
  // align-items: center;
  align-items: flex-start;
}
</style>
