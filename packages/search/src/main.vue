<template>
  <div class="search-container">
    <el-form :model="form" ref="formRef" :label-position="labelPos" :label-width="labelWidth">
      <el-row :gutter="rowGutter" :align="rowAlign">
        <el-col
          :span="item.cellNumber ? item.cellNumber * 6 : item.type && item.type.indexOf('range') > -1 ? 12 : 6"
          v-for="(item, index) in list"
          v-show="index < showItemsNumber"
          :key="index"
        >
          <el-form-item :label="item.label ? `${item.label}:` : ''">
            <template v-if="item.slotName">
              <slot :name="item.slotName"></slot>
            </template>
            <form-item
              :ref="item.prop"
              v-model="form[item.prop]"
              :itemOptions="item"
              :startTime="startTime"
              :endTime="endTime"
              @selectChange="selectChange"
              @selectCasChange="selectCasChange"
              @selectSearch="selectSearch"
              @onChange="onChange"
              @selectCasSearch="selectCasSearch"
              @searchMulOptions="searchMulOptions"
              @selectMulOptions="selectMulOptions"
              v-else
            ></form-item>
          </el-form-item>
        </el-col>
        <el-col
          :class="isFold ? 'fold-btns' : 'unfold-btns'"
          :span="advanceSearch ? 12 : 6"
          :offset="advanceSearch ? ((showItemsNumber % 4) - (colNum % 4)) * 6 : (3 - (colNum % 4)) * 6"
        >
          <div class="search-btns">
            <el-button
              type="primary"
              size="mini"
              @click="onAdvanceSearch"
              :disabled="advanceSearchDisabled"
              v-if="advanceSearch"
            >{{ advanceSearchText }}</el-button>
            <!--            <el-button type="primary" size="mini" @click="onSearch">{{ searchButtonText }}</el-button>-->
            <!--            <el-button size="mini" @click="onReset" v-if="!hideReset">{{ resetButtonText }}</el-button>-->
            <searchBtn
              :btnData="searchBtnProps"
              :btnText="searchButtonText"
              :isSearch="true"
              @b-click="onSearch"
            >
              <template v-slot:icon>
                <slot name="searchIcon"></slot>
              </template>
            </searchBtn>
            <searchBtn
              :btnData="resetBtnProps"
              :btnText="resetButtonText"
              :isSearch="false"
              @b-click="onReset"
              v-if="!hideReset"
            >
              <template v-slot:icon>
                <slot name="resetIcon"></slot>
              </template>
            </searchBtn>
            <el-button
              type="text"
              size="mini"
              @click="toggleFold"
              v-if="list.length > showSearchRow"
            >
              {{ isFold ? unfoldText : foldText }}
              <i
                :class="isFold ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
              ></i>
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <!-- <div class="fold" @click="toggleFold" v-if="list.length > 7">
      {{ isFold ? '高级搜索' : '收起' }}
      <i :class="isFold ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
    </div>-->
  </div>
</template>
<script>
import formItem from './formItem.vue';
import searchBtn from './searchBtn.vue';

export default {
  name: 'juggle-search',
  components: { formItem, searchBtn },
  emits: [
    'selectChange',
    'selectCasChange',
    'selectSearch',
    'selectCasSearch',
    'searchMulOptions',
    'selectMulOptions',
    'onChange',
  ],
  props: {
    /**
     * 表单项配置
     * 示例：
     * [{
     *   label: '用户名', // 标签文字
     *   prop: 'username', // 字段名
     *   elementType: 'input', // 指定组件类型
     *   initValue: 'blackstar', // 字段初始值
     *   placeholder: '请输入用户名', // 输入提示
     *   options:[], // 下拉或级联选择器选项
     *   optionProps: {label:'label',value:'value'}, // 选项标签、值key
     *   searchRemote: {
     *     queryApi: $apis.sale.bps.storeList, // 远程获取数据api
     *     queryParams: () => ({ storeType: 1 }), // 远程搜索参数
     *     queryRemoteKey: 'storeName' // 远程搜索字段
     *   },
     *   cellNumber: 1, // 占用列数
     *   dictType: 'STORE_TYPE', // 字典类型
     *   hasAll: true, // 是否显示全部
     *   slotName: 'status', // 若使用了插槽，需要引入一组数据并传入插槽名
     *   ...... // 可添加任意elementui组件支持的属性
     * }]
     */
    list: {
      type: Array,
      default() {
        return [];
      },
    },
    // 表单域标签位置
    labelPosition: {
      type: String,
      default: 'right',
    },
    // 表单项间距
    gutter: {
      type: Number,
      default: 0
    },
    // 表单项间距
    align: {
      type: String,
      default: 'top'
    },
    // 表单域标签宽度
    labelWidth: {
      type: String,
      default: '104px',
    },
    // 表单域标签位置是否为 top，true时，将忽略labelPosition、gutter的值
    isLabelTop: {
      type: Boolean,
      default: false,
    },
    // 是否隐藏重置按钮
    hideReset: {
      type: Boolean,
      default: false,
    },
    showSearchRow: {
      type: Number,
      default: 7,
    },
    // 是否有高级配置搜索
    advanceSearch: {
      type: Boolean,
      default: false,
    },
    // 高级搜索是否禁用
    advanceSearchDisabled: {
      type: Boolean,
      default: true,
    },
    // 查询按钮文案
    searchButtonText: {
      type: String,
      default: '查询',
    },
    // 重置按钮文案
    resetButtonText: {
      type: String,
      default: '重置',
    },
    searchBtnProps: {
      type: Object,
      default: () => {},
    },
    resetBtnProps: {
      type: Object,
      default: () => {},
    },
    // 高级配置搜索文案
    advanceSearchText: {
      type: String,
      default: '高级配置搜索',
    },
    // 收起文案
    foldText: {
      type: String,
      default: '收起',
    },
    // 展开文案
    unfoldText: {
      type: String,
      default: '展开',
    },
  },
  data() {
    return {
      form: {},
      // 是否折叠高级选项
      isFold: true,
      foldedNumber: this.list.length > this.showSearchRow ? this.showSearchRow : this.list.length,
    };
  },
  created() {
    this.addInitValue();
  },
  computed: {
    labelPos() {
      let rst = this.labelPosition
      if (this.isLabelTop) rst = 'top'
      return rst
    },
    rowGutter() {
      let rst = this.gutter
      if (this.isLabelTop) rst = 20
      return rst
    },
    rowAlign() {
      let rst = this.align
      if (this.isLabelTop) rst = 'bottom'
      return rst
    },
    showItemsNumber() {
      return this.isFold ? this.foldedNumber : this.list.length;
    },
    startTime() {
      return this.form.startTime;
    },
    endTime() {
      return this.form.endTime;
    },
    colNum() {
      let number = 0;
      const showList = this.list.slice(0, this.showItemsNumber);
      showList.map(item => {
        if (item.type && item.type.indexOf('range') > -1) {
          if (number % 4 === 3) { number += 3 }
          else { number += 2 }
        } else if (item.cellNumber) {
          number += item.cellNumber;
        } else {
          number += 1;
        }
      });
      return number;
    },
  },
  methods: {
    // 展开高级搜索项
    toggleFold() {
      this.isFold = !this.isFold;
      // 添加搜索组件折叠展开变量，用来table高度变化监听
      this.$store.state.isSearchFoldChange = !this.$store.state.isSearchFoldChange;
    },
    // 添加初始值
    addInitValue() {
      const obj = {};
      this.list.forEach(v => {
        if (v.initValue !== undefined) {
          obj[v.prop] = v.initValue;
        }
      });
      this.form = obj;
    },
    // 手动变更表单值
    setForm(prop, val) {
      this.form[prop] = val;
    },
    onChange(prop, val) {
      this.$emit('onChange', prop, val);
    },
    // 多选组件触发
    selectChange(data, prop) {
      this.form[prop] = data;
      this.$emit('selectChange', data, prop);
    },
    // 多选搜索
    selectSearch(data, prop) {
      this.$emit('selectSearch', data, prop);
    },
    // 级联多选触发
    selectCasChange(data, prop) {
      this.$emit('selectCasChange', data, prop);
    },
    // 级联多选搜索
    selectCasSearch(data, prop) {
      this.$emit('selectCasSearch', data, prop);
    },
    searchMulOptions(data, prop) {
      this.$emit('searchMulOptions', data, prop);
    },
    selectMulOptions(data, prop) {
      if (data?.length > 0) {
        this.form[prop] = data;
      } else {
        delete this.form[prop];
      }
      this.$emit('selectMulOptions', data, prop);
    },
    // 高级配置搜索
    onAdvanceSearch() {
      this.$emit('advanceSearch', this.form);
    },
    // 暴露参数
    getParams() {
      return this.form;
    },
    // 查询
    onSearch() {
      this.$emit('search', this.form);
    },
    // 重置
    onReset() {
      this.addInitValue();
      this.list.map(item => {
        if (item.elementType === 'cascader') {
          if (Array.isArray(item.initValue) && item.initValue.length) {
            let isAll = item.initValue.some(item => item === '');
            !isAll && (item.initValue = ['']);
            return;
          }
          if (Array.isArray(this.$refs[item.prop])) {
            this.$refs[item.prop][0].clearCascaderSelect();
          } else {
            this.$refs[item.prop].clearCascaderSelect();
          }
        }
        if (item.elementType === 'date') {
          if (Array.isArray(this.$refs[item.prop])) {
            this.$refs[item.prop][0].clearTime();
          } else {
            this.$refs[item.prop].clearTime();
          }
        }
        if (['multiSelect', 'multiCasSelect', 'newMultiSelect'].includes(item.elementType)) {
          if (Array.isArray(this.$refs[item.prop])) {
            this.$refs[item.prop][0].reload();
          } else {
            this.$refs[item.prop].reload();
          }
        }
      });
      this.$emit('reset');
    },
    // 清空多选的数据
    reload(prop) {
      if (this.$refs[prop]) {
        if (Array.isArray(this.$refs[prop])) {
          this.$refs[prop][0].reload();
        } else {
          this.$refs[prop].reload();
        }
      }
    },
  },
};
</script>
<style lang="less" scoped>
.search-container {
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 8px 26px;
  margin-bottom: 16px;
  background: #fff;
  /deep/.el-form-item {
    margin-bottom: 0px;
  }
  /deep/.el-form-item__label {
    line-height: 32px;
    padding-right: 8px;
  }
  /deep/.el-form-item__content {
    line-height: 32px;
  }
  /deep/ .el-input {
    line-height: 32px;
  }
  /deep/ .el-select {
    width: 100%;
  }
  /deep/ .el-cascader {
    width: 100%;
    line-height: 32px;
  }
  /deep/ .el-input-number {
    width: 100%;
    line-height: 30px;
  }
  /deep/ .el-input__inner {
    height: 32px;
    line-height: 32px;
  }
  /deep/ .el-input__icon {
    line-height: 32px;
  }
  /deep/ .el-range-separator {
    line-height: 24px;
  }
  /deep/ .el-icon-date {
    line-height: 26px;
  }
  .el-col {
    margin-top: 8px;
    margin-bottom: 8px;
  }
  .search-btns {
    float: right;
    display: flex;
    /deep/.el-button--mini {
      height: 32px;
    }
    /deep/.el-button--primary.is-disabled {
      background: #ccc;
      border-color: #ccc;
    }
  }
  .fold {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 104px;
    height: 17px;
    font-size: 12px;
    color: #606266;
    background: #fff;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    cursor: pointer;
    i {
      margin-left: 8px;
    }
  }
}
</style>
