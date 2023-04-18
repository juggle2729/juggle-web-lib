<template>
  <el-select
    v-model="modelValue"
    v-bind="$attrs"
    multiple
    collapse-tags
    size="small"
    :disabled="disabledMul"
    @change="selectMulOptions"
  >
    <template #empty>
      <div class="option-header">
        <div class="header-search">
          <el-input
            v-if="search"
            v-model="searchVal"
            size="small"
            :placeholder="searchPlaceholder"
            clearable
            @input="searchMulOptions"
            @clear="searchMulOptions"
          >
            <template #suffix>
              <i class="el-input__icon el-icon-search" style="color: #128a78" />
            </template>
          </el-input>
        </div>
        <div class="header-no-data">{{ noDataText }}</div>
      </div>
    </template>
    <div class="option-header">
      <div class="header-search">
        <el-input
          v-if="search"
          v-model="searchVal"
          size="small"
          :placeholder="searchPlaceholder"
          clearable
          @input="searchMulOptions"
          @clear="searchMulOptions"
        >
          <template #suffix>
            <i class="el-input__icon el-icon-search" style="color: #128a78" />
          </template>
        </el-input>
      </div>
      <div class="header-checkbox" v-if="options?.length > 0">
        <el-checkbox v-model="checkAll" :indeterminate="indeterminate" :label="selectAllText" @change="chooseAll" />
      </div>
      <div class="header-no-data" v-else>{{ noDataText }}</div>
    </div>
    <el-option
      v-for="item in options"
      :key="keyName ? item[keyName] : item.id"
      :label="labelName ? item[labelName] : item.label"
      :value="valueName ? item[valueName] : item.value"
    >
      <div>
        <div class="option-box">
          <el-image v-if="modelValue?.includes(valueName ? item[valueName] : item.value)" :src="ischeck" />
          <el-image v-else :src="nocheck" />
          {{ labelName ? item[labelName] : item.label }}
        </div>
      </div>
    </el-option>
  </el-select>
</template>

<script>
import { reactive, toRefs, ref, computed, watch } from 'vue';
import ischeck from '../assets/ischeck.png';
import nocheck from '../assets/nocheck.png';
import { debounce } from 'lodash';
export default {
  name: 'juggle-select-mul',
  props: {
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    selectedId: {
      type: Array,
      default: () => {
        return [];
      },
    },
    // 是否搜索
    search: {
      type: Boolean,
      default: false,
    },
    keyName: {
      type: String,
      default: '',
    },
    labelName: {
      type: String,
      default: '',
    },
    valueName: {
      type: String,
      default: '',
    },
    disabledMul: {
      type: Boolean,
      default: false,
    },
    toStringFlag: {
      type: Boolean,
      default: true,
    },
    searchPlaceholder: {
      type: [Number, String],
      default: '搜索',
    },
    noDataText: {
      type: [Number, String],
      default: '暂无数据',
    },
    selectAllText: {
      type: [Number, String],
      default: '全部',
    },
  },
  emits: ['searchMulOptions', 'selectMulOptions'],
  setup(props, context) {
    const state = reactive({
      modelValue: props.selectedId || null,
    });
    const checkAll = ref(false);
    const searchVal = ref('');
    watch(
      () => props.selectedId,
      val => {
        state.modelValue = val || null;
      },
      { deep: true }
    );
    // 全选状态
    const indeterminate = computed(() => {
      const valueList = getValueList();
      if (state.modelValue?.length >= valueList?.length) {
        checkAll.value = true;
        return false;
      }
      if (state.modelValue?.length > 0) {
        checkAll.value = false;
        return true;
      }
      checkAll.value = false;
      return null;
    });
    // 点击全选按钮
    const chooseAll = val => {
      const valueList = getValueList();
      if (val) {
        state.modelValue = valueList;
      } else {
        state.modelValue = [];
      }
      let postVal = state.modelValue;
      if (props.toStringFlag) postVal = postVal?.toString();
      context.emit('selectMulOptions', postVal);
    };
    // 获取value的集合
    const getValueList = () => {
      const reslut = props.options.map(item => (props.valueName ? item[props.valueName] : item.value));
      return reslut;
    };
    const searchMulOptions = debounce(val => {
      context.emit('searchMulOptions', val);
    }, 500);

    const selectMulOptions = val => {
      let postVal = val;
      if (props.toStringFlag) postVal = postVal.toString();
      context.emit('selectMulOptions', postVal);
    };

    const reload = () => {
      state.modelValue = null;
      checkAll.value = false;
      searchVal.value = '';
    };

    return {
      ...toRefs(state),
      ischeck,
      nocheck,
      indeterminate,
      chooseAll,
      checkAll,
      searchVal,
      searchMulOptions,
      selectMulOptions,
      reload,
    };
  },
};
</script>

<style lang="less" scoped>
.option-header {
  padding: 0 20px;
  .header-search {
    margin: 12px 0;
  }
  .el-checkbox {
    width: 100%;
  }
  .header-no-data {
    margin-bottom: 16px;
    color: #c2c2c2;
    display: flex;
    justify-content: center;
  }
}
.el-select-dropdown__item {
  height: 26px;
  line-height: 26px;
  &:hover {
    background: rgba(18, 138, 120, 0.05);
  }
}
.option-box {
  height: 100%;
  // display: flex;
  align-items: center;
  .el-image {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }
}
:deep(.el-select .el-select__tags .el-tag) {
  background: #f5f9f5;
}
</style>
