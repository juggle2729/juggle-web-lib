<template>
  <el-form :inline="inline" :class="{'el-form__custom': inline}">
    <el-form-item v-for="(item, index) in list" :key="index" :label="item.label" :style="{order: item.order || 0}">
      <!--时间选择 开始结束-->
      <el-date-picker
        v-if="item.type === 'daterange'"
        v-model="queryParams[item.model]"
        :type="item.type"
        :size="size"
        value-format="timestamp"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
      <el-date-picker
        v-else-if="item.type === 'datetimerange'"
        v-model="queryParams[item.model]"
        :type="item.type"
        :size="size"
        value-format="timestamp"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      />
      <el-date-picker
        v-else-if="item.type === 'date'"
        v-model="queryParams[item.model]"
        :type="item.type"
        :size="size"
        placeholder="选择日期"
        value-format="timestamp"
      />
      <el-date-picker
        v-else-if="item.type === 'month'"
        v-model="queryParams[item.model]"
        :type="item.type"
        :size="size"
        value-format="timestamp"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
      <!--输入框-->
      <el-input
        v-else-if="item.type === 'number' || item.type === 'text'"
        :type="item.type"
        :size="size"
        :multiple-num="item.multipleNum"
        :placeholder="item.placeholder"
        @keypress="handleKeypress($event, item)"
        :maxlength="item.maxlength"
        v-model="queryParams[item.model]"
      />
      <!--输入框-->
      <el-input
        v-else-if="item.type === 'inputNumber'"
        type="text"
        :size="size"
        :multiple-num="item.multipleNum"
        :placeholder="item.placeholder"
        @input="handleInput($event, item)"
        :maxlength="item.maxlength"
        v-model="queryParams[item.model]"
      />
      <!--下拉框-->
      <el-select
        v-else-if="item.type === 'select'"
        :size="size"
        v-model="queryParams[item.model]"
        :placeholder="item.placeholder||'请选择'"
        :filterable="item.filterable"
        :remote="item.remote"
        :remote-method="item.remoteMethod"
        :multiple="item.multiple"
        :multiple-limit="item.multipleLimit"
        :collapse-tags="item.collapseTags"
        clear
      >
        <el-option
          v-for="(o, index) in item.options"
          :key="index"
          :label="o.label"
          :value="o.value"
        ></el-option>
      </el-select>
      <!--级联-->
      <el-cascader
        v-else-if="item.type === 'cascader'"
        :size="size"
        :props="item.props"
        v-model="queryParams[item.model]"
        :placeholder="item.placeholder||'请选择'"
      ></el-cascader>
    </el-form-item>
    <template>
      <slot name="extra-input" />
    </template>
    <el-form-item>
      <el-button type="primary" :size="size" @click="onConfirm" v-if="!hideQueryButton">查询</el-button>
      <el-button
        style="margin-left: 10px;"
        :size="size"
        @click="onCancel"
        v-if="!hideClearButton"
      >清除</el-button>
      <slot name="extra-btn" />
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'headerQuery',
  data() {
    return {
      queryParams: { ...this.defaultQueryParams }, // 当前组件实例的所有参数 包括双向绑定
      resParams: {} // 浅拷贝 queryParams 返回最终的参数 ps：因为时间选择器的model会有两个值 所以浅拷贝不会影响组件的modal值
    }
  },
  props: {
    items: {
      // 数据项
      type: Array,
      default: () => []
    },
    allowTrim: Boolean,
    defaultQueryParams: {
      // 默认参数
      type: Object,
      default: () => {}
    },
    size: {
      // 表单大小
      type: String,
      default: () => 'mini'
    },
    inline: {
      // 行内表单模式
      type: Boolean,
      default: true
    },
    hideClearButton: Boolean,
    hideQueryButton: Boolean
  },
  computed: {
    list() {
      return this.items
    }
  },
  mounted() {
    // 回显输入框的值
    this.items.forEach(item => {
      if (item.value !== null && item.value !== undefined) {
        // this.queryParams[item.model] = item.value;
        this.$set(this.queryParams, item.model, item.value)
      }
    })
  },
  methods: {
    handleInput(event, item) {
      this.queryParams[item.model] = event.target.value.replace(/[^0-9]/g, '')
    },
    handleKeypress(event, { type, isDecimal, maxlength, multipleNum }) {
      const { keyCode } = event
      if (event.target.value.length >= maxlength) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (type === 'number') {
        if (!isDecimal) {
          if (keyCode < 48 || keyCode > 57) {
            event.preventDefault()
            event.stopPropagation()
          }
        } else if (keyCode === 101 || keyCode === 69) {
          // E & e
          event.preventDefault()
          event.stopPropagation()
        }
      } else if (multipleNum) {
        // 支持多数字输入，以空格分隔
        if (event.keyCode !== 32 && (event.keyCode < 48 || event.keyCode > 57)) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    },
    // 清除
    onCancel() {
      this.clearQueryData()
      this.resParams = { ...this.queryParams }
      this.$emit('on-cancel')
      this.onParamsChange()
    },
    clearQueryData() {
      for (const i in this.queryParams) {
        // eslint-disable-line
        this.queryParams[i] = null
      }
    },
    onConfirm() {
      this.onParamsChange()
    },
    // 触发提交
    onParamsChange() {
      const params = { ...this.queryParams }
      if (!this.allowTrim) {
        // 如果不允许输入空格 （默认不能输入）
        for (const item in params) {
          // eslint-disable-line
          if (typeof params[item] === 'string') {
            params[item] = params[item].trim()
          }
        }
      }
      this.$emit('on-params-change', params)
    }
  }
}
</script>
<style lang="less" scoped>
/deep/ .el-form-item__label{
  font-size:12px;
  color: #909399;
}
/deep/ .el-form-item {
  flex: 0 0 1;
  margin-bottom: 0;
}

.el-form__custom {
  display: flex;
  flex-wrap: wrap;
}
</style>
