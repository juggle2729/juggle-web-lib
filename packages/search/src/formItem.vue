<template>
  <div class="form-cell">
    <el-input
      v-if="isInput"
      :model-value="modelValue"
      maxlength="40"
      v-bind="bindProps"
      @input="onChange($event, itemOptions.prop)"
      @change="onChange($event, itemOptions.prop)"
    ></el-input>
    <el-input
      v-if="isPhone"
      :model-value="modelValue"
      type="text"
      maxlength="11"
      v-bind="bindProps"
      @input="onChange($event, itemOptions.prop)"
      @change="onChange($event, itemOptions.prop)"
    ></el-input>
    <el-input
      v-if="isSelectID"
      :model-value="modelValue"
      type="text"
      maxlength="6"
      v-bind="bindProps"
      @input="onChange($event, itemOptions.prop)"
      @change="onChange($event, itemOptions.prop)"
    ></el-input>
    <el-select
      v-if="isSelect"
      :model-value="modelValue"
      collapse-tags
      :filterable="isRemote"
      :remote="isRemote"
      :clearable="isRemote"
      :remote-method="remoteOptions"
      :loading="loading"
      v-bind="bindProps"
      @change="onChange($event, itemOptions.prop)"
      @focus="onFocus"
    >
      <el-option
        v-for="item in options"
        :key="item[optionProps.value]"
        :label="item[optionProps.label]"
        :value="item[optionProps.value]"
      ></el-option>
    </el-select>
    <el-cascader
      :key="`${itemOptions.prop}_${keyNum}`"
      v-if="isCascader"
      :ref="itemOptions.prop"
      :model-value="modelValue"
      v-bind="bindProps"
      @change="onChange($event, itemOptions.prop)"
    ></el-cascader>
    <el-date-picker
      v-if="isDate"
      style="width: 100%"
      v-model="time"
      type="date"
      :disabledDate="disabledDate"
      v-bind="bindProps"
      @change="onChange($event, itemOptions.prop)"
    ></el-date-picker>
    <juggle-select-flat
      ref="selectFlat"
      v-if="isMultiSelect"
      v-bind="bindProps"
      :data="mulOptions"
      :disabledFlat="itemOptions.secDisabled"
      :selectedId="itemOptions.selectedId"
      :search="itemOptions.search"
      @selectChange="selectChange($event, itemOptions.prop)"
      @selectSearch="selectSearch($event, itemOptions.prop)"
    ></juggle-select-flat>
    <juggle-select-cascader
      ref="selectCascader"
      v-if="isMultiCasSelect"
      :data="mulOptions"
      :disabledCas="itemOptions.secDisabled"
      :selectedId="itemOptions.selectedId"
      :search="itemOptions.search"
      @selectCasChange="selectCasChange($event, itemOptions.prop)"
      @selectCasSearch="selectCasSearch($event, itemOptions.prop)"
    ></juggle-select-cascader>
    <juggle-select-mul
      ref="selectMul"
      v-if="isSelectMul"
      :options="newMulOptions"
      :disabledMul="itemOptions.disabledMul"
      :search="itemOptions.search"
      :keyName="itemOptions.dictType ? 'dictCode' : itemOptions.keyName"
      :labelName="itemOptions.dictType ? 'dictValue' : itemOptions.labelName"
      :valueName="itemOptions.dictType ? 'dictCode' : itemOptions.valueName"
      :selectedId="itemOptions.selectedId"
      :toStringFlag="itemOptions.toStringFlag"
      @searchMulOptions="searchMulOptions($event, itemOptions.prop)"
      @selectMulOptions="selectMulOptions($event, itemOptions.prop)"
    ></juggle-select-mul>
  </div>
</template>
<script>
export default {
  emits: [
    'update:modelValue',
    'selectChange',
    'selectCasChange',
    'selectSearch',
    'selectCasSearch',
    'searchMulOptions',
    'selectMulOptions',
    'onChange'
  ],
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    // 表单配置项见main.vue
    itemOptions: {
      type: Object,
      default() {
        return {};
      },
    },
    startTime: [Date, Number],
    endTime: [Date, Number],
  },
  data() {
    return {
      useDict: true,
      keyNum: 0,
      time: this.modelValue,
      searchOptions: [],
      loading: false,
      optionProps: this.itemOptions.optionProps || { label: 'label', value: 'value' },
    };
  },
  watch: {
    modelValue() {
      if (this.isDate) {
        this.time = this.modelValue;
      }
    },
  },
  methods: {
    // 双向绑定
    onChange(val, prop) {
      let value = val;
      // 时间直接处理为毫秒值
      if (this.itemOptions.elementType === 'date') {
        if (Array.isArray(val)) {
          value = [new Date(val[0]).getTime(), new Date(val[1]).getTime()];
          // 结束时间转换为23:59:59
          if (this.itemOptions.type === 'daterange') {
            value = [new Date(val[0]).getTime(), new Date(val[1]).setHours(23, 59, 59, 0)];
          }
        } else {
          value = new Date(val).getTime();
        }
      }
      // 结束时间转换为23:59:59
      if (this.itemOptions.prop === 'endTime' && (this.itemOptions.type === 'date' || !this.itemOptions.type)) {
        value = new Date(val).setHours(23, 59, 59, 0);
      }

      // 手机号限制输入
      if (this.itemOptions.elementType === 'phone') {
        value = val.replace(/\D/g, '');
      }
      if (this.itemOptions.elementType === 'selectID') {
        value = val.replace(/\D/g, '');
      }
      this.$emit('update:modelValue', value, prop);
      this.$emit('onChange', value, prop);
    },
    // 重置级联选择
    clearCascaderSelect() {
      this.$refs[this.itemOptions.prop].$refs.panel.clearCheckedNodes();
      this.keyNum += 1;
    },
    // 可选时间判断
    disabledDate(time) {
      if (this.itemOptions.prop === 'startTime' && this.endTime) {
        return time.getTime() > new Date(this.endTime).getTime();
      }
      if (this.itemOptions.prop === 'endTime' && this.startTime) {
        return time.getTime() < new Date(this.startTime).getTime();
      }
      return false;
    },
    // 重置时间
    clearTime() {
      this.$nextTick(() => {
        this.time = this.modelValue;
      });
    },
    // 远程搜索
    remoteOptions(val) {
      if (!this.itemOptions.searchRemote) return;
      const { queryApi, queryParams, queryRemoteKey, isPager } = this.itemOptions.searchRemote;
      if (!queryApi) throw new Error('filterSelect必须传入queryApi参数');
      let params = {};
      if (queryParams) params = queryParams();
      params[queryRemoteKey] = val;
      if (val !== '') {
        this.loading = true;
        queryApi(params).then(res => {
          this.loading = false;
          let list = [];
          if (isPager) {
            list = res.records || [];
          } else {
            list = res || [];
          }
          this.searchOptions = list;
        });
      } else {
        this.searchOptions = [];
      }
    },
    // 多选切换
    selectChange(data, prop) {
      this.$emit('selectChange', data, prop);
    },
    // 多选筛选
    selectSearch(data, prop) {
      this.$emit('selectSearch', data, prop);
    },
    // 级联多选切换
    selectCasChange(data, prop) {
      this.$emit('selectCasChange', data, prop);
    },
    // 级联搜索
    selectCasSearch(data, prop) {
      this.$emit('selectCasSearch', data, prop);
    },
    searchMulOptions(data, prop) {
      this.$emit('searchMulOptions', data, prop);
    },
    selectMulOptions(data, prop) {
      this.$emit('selectMulOptions', data, prop);
    },
    // 多选重置
    reload() {
      if (this.$refs.selectFlat) {
        this.$refs.selectFlat.reload();
      }
      if (this.$refs.selectCascader) {
        this.$refs.selectCascader.reload();
      }
      if (this.$refs.selectMul) {
        this.$refs.selectMul.reload();
      }
    },
    onFocus() {
      if (!this.itemOptions.initialData) return;
      this.remoteOptions(this.itemOptions.getinitialDataValue);
    },
  },
  computed: {
    // 绑定属性
    bindProps() {
      let obj = { ...this.itemOptions };
      // 移除冗余属性
      delete obj.label;
      delete obj.prop;
      delete obj.initValue;
      delete obj.elementType;
      if (obj.elementType === 'select') {
        delete obj.options;
      }
      return obj;
    },
    isInput() {
      return this.itemOptions.elementType === 'input' || !this.itemOptions.elementType;
    },
    isPhone() {
      return this.itemOptions.elementType === 'phone';
    },
    isSelect() {
      return this.itemOptions.elementType === 'select';
    },
    isSelectID() {
      return this.itemOptions.elementType === 'selectID';
    },
    isCascader() {
      return this.itemOptions.elementType === 'cascader';
    },
    isDate() {
      return this.itemOptions.elementType === 'date';
    },
    isRemote() {
      return this.itemOptions.searchRemote;
    },
    isMultiSelect() {
      return this.itemOptions.elementType === 'multiSelect';
    },
    isMultiCasSelect() {
      return this.itemOptions.elementType === 'multiCasSelect';
    },
    isSelectMul() {
      return this.itemOptions.elementType === 'newMultiSelect';
    },
    options() {
      if (this.itemOptions.searchRemote) return this.searchOptions;
      return this.itemOptions.dictType
        ? this.$opts(this.itemOptions.dictType, this.itemOptions.hasAll).map(item => {
          return {
            label: item.dictValue,
            value: item.dictCode,
          };
        })
        : this.itemOptions.options;
    },
    mulOptions() {
      if (this.isMultiCasSelect) {
        return this.itemOptions.dictType ? this.$optsCascader(this.itemOptions.dictType) : this.itemOptions.options;
      }
      return this.itemOptions.dictType ? this.$opts(this.itemOptions.dictType) : this.itemOptions.options;
    },
    newMulOptions() {
      return this.itemOptions.dictType ? this.$opts(this.itemOptions.dictType) : this.itemOptions.options;
    },
  },
};
</script>
