<template>
<div class="juggle-table-select-total">
  <i class="el-icon-warning"></i>
  <div class="content">
    <slot>
      <span class="tip">已选当前页{{selectNum}}项</span>
      <el-button type="text" v-if="visibleSelectAll" @click="selectAll">选择全部{{total}}项</el-button>
      <el-button type="text" @click="clear">{{clearBtnText}}</el-button>
    </slot>
  </div>
</div>
</template>

<script>
export default {
  name: "juggleTableSelectTotal",
  emit: ['selectAll', 'clear'],
  props: {
    selectNum: {
      type: [String, Number],
      default: 0,
    },
    total: {
      type: [String, Number],
      default: 0,
    },
    visibleSelectAll: {
      type: [String, Number],
      default: 0,
    },
    clearBtnText: {
      type: String,
      default: '清除所选内容',
    },
  },
  data() {
    return{

    }
  },
  methods: {
    selectAll() {
      this.$emit('selectAll');
    },
    clear() {
      this.$emit('clear');
    },
  }
}
</script>

<style scoped lang="less">
.juggle-table-select-total{
  margin-top: 15px;
  padding: 10px 15px;
  height: 42px;
  background-color: rgba(18, 138, 120, 0.1);
  border: 1px solid rgba(18, 138, 120, 0.5);
  box-sizing: border-box;
  border-radius: 4px;
  color: #606266;
  display: flex;
  align-items: center;
  font-size: 14px;
}
.el-icon-warning{
  color: #2B92F0;
  margin-right: 10px;
  font-size: 16px;
}
.tip{
  margin-right: 10px;
}
</style>