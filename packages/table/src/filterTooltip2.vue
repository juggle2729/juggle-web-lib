<template>
  <div class="juggle-filter-tooltip">
    <el-popover placement="bottom-end" trigger="click" :width="230" popper-class="juggle-filter-popper">
      <template #reference>
        <div class="filter-btn">
          <i :class="['iconfont icon-icon-screen', checkedList.length > 0 ? 'green-color' : 'gray-color']"></i>
        </div>
      </template>
      <div class="list">
        <div class="flex">
          <el-checkbox class="checkbox" :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">{{
            allText
          }}</el-checkbox>
          <span class="btn" @click="resetHandle">重置</span>
        </div>
        <draggable
          :list="list"
          item-key="name"
          class="list-group"
          ghost-class="ghost"
          @start="drag = true"
          @end="dragEnd"
        >
          <template #item="{ element }">
            <div class="list-group-item">
              <img src="../assets/img/draggable.svg" style="margin-right: 16px; vertical-align: middle" />
              <el-checkbox
                v-model="element.visible"
                :label="element.label"
                @change="checkboxChange"
                :disabled="element.disabled || element.label === '操作'"
              >
              </el-checkbox>
            </div>
          </template>
        </draggable>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue';
import { useColumnsHook } from './useColumnsHook.js';
import draggable from 'vuedraggable';
export default {
  name: 'juggleFilterTooltip',
  emit: ['update:modelValue', 'reset'],
  components: {
    draggable,
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    allText: {
      type: [Number, String],
      default: '全选列',
    },
    config: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      list: [],
      checkAll: false,
      checkedList: [],
      isIndeterminate: false,
      drag: false,
    });
    const updateModelValue = () => {
      emit('update:modelValue', state.checkedList);
      change(state.list);
    };
    const { change } = useColumnsHook(props.config);
    const dragEnd = () => {
      state.drag = false;
      state.checkedList = state.list.filter(item => item.visible).map(item => item.value);
      updateModelValue();
      emit('refresh');
    };
    const resetHandle = () => {
      emit('reset');
    };
    const checkboxChange = () => {
      const list = state.list.filter(item => item.visible);
      state.checkedList = list.map(item => item.value);
      const checkedCount = state.checkedList.length;
      // 全选中为true
      state.checkAll = checkedCount === state.list.length && checkedCount > 0;
      state.isIndeterminate = checkedCount > 0 && checkedCount < state.list.length;
      updateModelValue();
    };
    // 全选
    const checkAllChange = val => {
      state.list = state.list.map(item => {
        item.visible = val;
        return item;
      });
      if (!val) {
        state.checkedList = [];
      } else {
        state.checkedList = state.list.map(item => item.value);
      }
      state.isIndeterminate = false;
      updateModelValue();
    };

    // init
    watch(
      () => props.options,
      val => {
        state.list = val || [];
      },
      { immediate: true }
    );
    watch(
      () => props.modelValue,
      val => {
        state.checkedList = val || [];
        const checkedCount = state.checkedList.length;
        state.checkAll = checkedCount === state.list.length && checkedCount > 0;
        state.isIndeterminate = checkedCount > 0 && checkedCount < state.list.length;
      },
      { immediate: true }
    );

    return {
      ...toRefs(state),
      checkboxChange,
      checkAllChange,
      dragEnd,
      resetHandle,
    };
  },
};
</script>

<style lang="less" scoped>
.list-group-item {
  line-height: 32px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.flex {
  display: flex;
  justify-content: space-between;
  .btn {
    color: #128a78;
    cursor: pointer;
  }
}
.juggle-filter-tooltip {
  position: absolute;
  top: 9px;
  right: 20px;
  z-index: 3;
  height: 42px;
  display: flex;

  .filter-btn {
    width: 24px;
    margin: auto;
    cursor: pointer;
    .iconfont {
      font-size: 14px;
    }
    .green-color {
      color: #128a78;
    }
    .gray-color {
      color: #606266;
    }
  }
}
.checkbox {
  margin-bottom: 10px;
  display: block;
  &:last-child {
    margin-bottom: 0;
  }
}
.list {
  max-height: 368px;
  overflow-y: scroll;
}
.el-checkbox-group {
  padding-top: 10px;
  position: relative;
}
.el-checkbox-group:before {
  position: absolute;
  box-sizing: border-box;
  content: ' ';
  pointer-events: none;
  left: -12px;
  right: -12px;
  top: 0;
  border-bottom: 1px solid #f2f2f2;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
}
/deep/.el-checkbox__input.is-disabled + span.el-checkbox__label {
  color: #cccccc;
  cursor: not-allowed;
}
</style>
<style>
.juggle-filter-popper.el-popper.is-light {
  border-radius: 4px;
  min-width: 122px;
  padding: 16px 12px;
}
</style>
