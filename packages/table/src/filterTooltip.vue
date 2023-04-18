<template>
  <div class="juggle-filter-tooltip">
    <el-popover
        placement="bottom-end"
        trigger="click"
        popper-class="juggle-filter-popper"
    >
      <template #reference>
        <div class="filter-btn">
          <i :class="['iconfont icon-icon-screen', checkedList.length>0 ? 'green-color' : 'gray-color']"></i>
        </div>
      </template>
      <div class="list">
        <el-checkbox class="checkbox" :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">{{allText}}</el-checkbox>
        <el-checkbox-group v-model="checkedList" @change="checkboxChange">
          <el-checkbox
              class="checkbox"
              v-for="item in list"
              :key="item.value"
              :label="item.value"
              :disabled="item.disabled || item.label=='操作'"
          >{{item.label}}</el-checkbox>
        </el-checkbox-group>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue';
export default {
  name: "juggleFilterTooltip",
  emit: ['update:modelValue'],
  props: {
    options: {
      type: Array,
      default: () => ([]),
    },
    modelValue: {
      type: Array,
      default: () => ([]),
    },
    allText: {
      type: [Number, String],
      default: '全选'
    }
  },
  setup(props, {emit}) {
    const state = reactive({
      list: [],
      checkAll: false,
      checkedList: [],
      isIndeterminate: false,
    });

    const updateModelValue = () => {
      emit('update:modelValue', state.checkedList);
      emit('change', state.checkedList);
    }

    const checkboxChange = () => {
      const list  = state.list.filter(item => !(item.disabled && !item.visible));
      const checkedCount = state.checkedList.length;
      state.checkAll = checkedCount === list.length;
      state.isIndeterminate = checkedCount > 0 && checkedCount < list.length;
      updateModelValue();
    }

    const checkAllChange = (val) => {
      let list = state.list.filter(item => !(item.disabled && !item.visible));
      if (!val) {
        list = state.list.filter(item => item.visible && item.disabled);
      }
      list = list.map(item => item.value);
      state.checkedList = list;
      state.isIndeterminate = false;
      updateModelValue();
    }

    // init
    watch(() => props.options, (val) => {
      state.list = val || [];
    }, {immediate: true});
    watch(() => props.modelValue, (val) => {
      state.checkedList = val || [];
      checkboxChange();
    }, {immediate: true});

    return {
      ...toRefs(state),
      checkboxChange,
      checkAllChange,
    }
  },
}
</script>

<style lang="less" scoped>
.juggle-filter-tooltip{
  position: absolute;
  top: 9px;
  right: 20px;
  z-index: 3;
  height: 42px;
  display: flex;
  .filter-btn{
    width: 24px;
    margin: auto;
    cursor: pointer;
    .iconfont{
      font-size: 14px;
    }
    .green-color{
      color: #128A78;
    }
    .gray-color{
      color: #606266;
    }
  }
}
.checkbox{
  margin-bottom: 10px;
  display: block;
  &:last-child{
    margin-bottom: 0;
  }
}
.list{
  max-height: 368px;
  overflow-y: scroll;
}
.el-checkbox-group{
  padding-top: 10px;
  position: relative;
}
.el-checkbox-group:before{
    position: absolute;
    box-sizing: border-box;
    content: ' ';
    pointer-events: none;
    left: -12px;
    right: -12px;
    top: 0;
    border-bottom: 1px solid #F2F2F2;
    -webkit-transform: scaleY(.5);
    transform: scaleY(.5);
}
/deep/.el-checkbox__input.is-disabled + span.el-checkbox__label {
    color: #CCCCCC;
    cursor: not-allowed;
}
</style>
<style>
.juggle-filter-popper.el-popper.is-light{
  border-radius: 4px;
  min-width: 122px;
  padding: 16px 12px;
}
</style>
