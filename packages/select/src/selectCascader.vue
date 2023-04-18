
<template>
  <el-popover ref="popover" placement="bottom" :width="180" :popper-class="'popover'" trigger="click"  :disabled="disabledCas">
    <template #reference>
      <el-select
        :disabled="disabledCas"
        ref="select"
        size="small"
        @focus="onFocus"
        v-model="selectedData"
        multiple
        :placeholder="selectPlaceholder"
        collapse-tags
        @remove-tag="removeSelectedNodes"
      >
        <el-option v-for="item in options" :key="item.dictCode" :label="item.dictValue" :value="item.dictCode">
        </el-option>
      </el-select>
    </template>
    <el-input
      style="margin-bottom: 10px"
      size="small"
      v-if="search"
      :placeholder="searchPlaceholder"
      @input="searchChange"
      v-model="searchVal"
      @clear="searchChange"
    >
      <template #suffix>
        <i class="el-input__icon el-icon-search" style="color: #128a78"></i>
      </template>
    </el-input>
    <span v-if="chooseAll && data.length > 0"
      ><el-checkbox
        :indeterminate="isIndeterminate"
        style="margin-left: 24px"
        v-model="checkALL"
        @change="checkALLChange"
      />
      {{selectAllText}}</span
    >
    <el-tree
      :data="data"
      :show-checkbox="!strictly"
      :check-strictly="strictly"
      node-key="dictCode"
      ref="tree"
      @check-change="handleCheckChange"
      highlight-current
      :props="defaultProps"
      :default-checked-keys="selectedData"
      @node-click="nodeClick"
    >
    </el-tree>
  </el-popover>
</template>

<script>
export default {
  name: 'juggle-select-cascader',
  emits: ['selectCasChange'],
  props: {
    // 列表数据
    data: {
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
    selectOptions: {
      type: Array,
      default: () => {
        return [];
      },
    },
    strictly: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    // 是否可以搜索
    search: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    // 是否开启全选
    chooseAll: {
      type: Boolean,
      default: true,
    },
    // 节点解析props
    defaultProps: {
      type: Object,
      default: () => ({
        children: 'children',
        label: 'dictValue',
      }),
    },
    // 永远不会出现全选 注意与chooseAll的区别
    noChooseAll: {
      type: Boolean,
      default: false,
    },
    disabledCas: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    selectPlaceholder: {
      type: [Number, String],
      default: '请选择'
    },
    searchPlaceholder: {
      type: [Number, String],
      default: '搜索'
    },
    selectAllText: {
      type: [Number, String],
      default: '全部'
    }
  },
  watch: {
    selectedId(val) {
      this.selectedData = val || '';
    },
    data(newObj) {
      if (this.first && newObj.length > 0) {
        this.allData = newObj;
        this.allDataLength = this.allData.length;
        this.allData.forEach(item => {
          if (item.children) {
            this.allDataLength = item.children.length + this.allDataLength;
          }
        });
        if (this.selectedData.length > 0) {
          this.checkIsIndeterminate();
        }
        if (newObj[0].children) {
          this.treeData(newObj).then(res => {
            this.options = res;
          });
        } else {
          this.options = newObj;
        }
        this.first = false;
      }
    },
  },
  data() {
    return {
      originOptions: [],
      oldData: [],
      allData: null,
      allDataLength: 0,
      options: this.selectOptions,
      selectedData: this.selectedId || '',
      isIndeterminate: false,
      searchVal: '',
      checkALL: false,
      first: true,
      searchTimer: null
    };
  },
  methods: {
    // 重置
    reload() {
      if (this.disabledCas)
        return false;
      this.options = [];
      this.selectedData = '';
      this.$refs.tree.setCheckedKeys([]);
      this.isIndeterminate = false;
      this.checkALL = false;
    },
    //树形数据扁平
    async treeData(source) {
      let res = [];
      function fn(data) {
        data.forEach(el => {
          res.push(el);
          el.children && el.children.length > 0 ? fn(el.children) : ''; // 子级递归
        });
      }
      fn(source);
      return res;
    },
    //判断全选-
    checkIsIndeterminate() {
      this.isIndeterminate = this.selectedData.length > 0 && this.selectedData.length < this.allDataLength;
      if (this.selectedData.length === 0) {
        this.selectedData = '';
        this.options = [];
      }
      if (this.selectedData.length === 1 && this.selectedData[0] === '') {
        this.isIndeterminate = false;
      }
      if (this.noChooseAll) {
        this.isIndeterminate = false;
        return false;
      }
      if (this.selectedData.length > 0 && !this.isIndeterminate) {
        this.selectedData = [''];
        this.options = [{ dictCode: '', dictValue: '全部' }];
      }
    },
    onFocus() {
      //去除select默认项
      this.$refs.select.blur();
    },
    //全选
    checkALLChange() {
      if (this.checkALL) {
        // 全选
        this.$refs.tree.setCheckedNodes(this.data);
      } else {
        // 取消选中
        this.$refs.tree.setCheckedKeys([]);
      }
    },
    // 筛选
    nodeClick(data) {
      if (this.strictly) {
        this.options = [data].map(item => {
          let node = this.$refs.tree.getNode(item.toString()); // 所有被选中的节点对应的node
          let tmpMap = {};
          tmpMap.dictCode = node.key;
          tmpMap.dictValue = node.label;
          return tmpMap;
        });
        this.selectedData = [data.dictCode];
        this.$refs.tree.setCheckedNodes([data]);
        this.$refs.popover.hide();
        setTimeout(() => {
          this.$emit('selectCasChange', this.selectedData);
        }, 500);
      }
    },
    //多选 节点选中状态发生变化时的回调
    handleCheckChange() {
      if (!this.strictly) {
        this.processCheck();
      }
    },
    // 多选,删除任一select选项的回调
    removeSelectedNodes(val) {
      if (val) {
        this.$refs.tree.setChecked(val.toString(), false, true);
        let node = this.$refs.tree.getNode(val.toString());
        if (node.childNodes.length > 0) {
          node.childNodes.map(item => {
            if (item.childNodes.length <= 0) {
              this.$refs.tree.setChecked(item.toString(), false, true);
            }
          });
          this.handleCheckChange();
        }
        this.selectedData.length < 1 ? (this.checkALL = false) : (this.checkALL = true);
        setTimeout(() => {
          this.checkIsIndeterminate();
          this.$emit('selectCasChange', this.selectedData);
        }, 100);
      } else {
        this.$refs.tree.setCheckedKeys([]);
      }
    },
    searchChange(e) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }
      this.searchTimer = setTimeout(() => {
        this.oldData = JSON.parse(JSON.stringify(this.data));
        this.$emit('selectCasSearch', e);
      }, 500);
    },
    //带搜索的数据处理
    processCheck() {
      let checkedKeys = this.$refs.tree.getCheckedKeys(); // 所有被选中的节点的 key 所组成的数组数据
      let checkoptions = checkedKeys.map(item => {
        let node = this.$refs.tree.getNode(item.toString()); // 所有被选中的节点对应的node
        let tmpMap = {};
        tmpMap.dictCode = node.key;
        tmpMap.dictValue = node.label;
        return tmpMap;
      });
      let checkIds = checkoptions.map(item => {
        return item.dictCode;
      });
      if (this.selectedData.length > 0 && this.searchVal) {
        this.options = this.allData;
        let nowIds = this.data.map(item => {
          return item.dictCode;
        });
        let dataSet = new Set(checkIds);
        let diff = nowIds.filter(item => !dataSet.has(item));
        let collection = Array.from(new Set([...this.selectedData, ...checkIds]));
        diff.forEach(item1 => {
          collection.forEach((item2, j) => {
            if (item2 == item1) {
              collection.splice(j, 1);
              j -= 1;
            }
          });
        });
        this.selectedData = collection;
      } else {
        this.options = checkoptions;
        this.selectedData = checkoptions.map(item => {
          return item.dictCode;
        });
      }
      checkoptions < 1 ? (this.checkALL = false) : (this.checkALL = true);
      setTimeout(() => {
        this.checkIsIndeterminate();
        this.$emit('selectCasChange', this.selectedData);
      }, 100);
    },
  },
};
</script>
<style lang="less">
.el-tree {
  max-height: 360px !important;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
    background: #d9d9d9;
    border-radius: 3px;
  }
}
</style>
<style lang="less" scoped>
.popover {
  max-height: 400px;
  overflow: scroll;
}
/deep/.el-tree-node__label,
.el-tree-node__content {
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
/deep/.is-current,
.is-checked {
  background: rgba(18, 138, 120, 0.15);
}
/deep/.el-tree-node:focus > .el-tree-node__content {
  background-color: rgba(18, 138, 120, 0.05) !important;
}
/deep/.el-tree-node__content:hover {
  background-color: rgba(18, 138, 120, 0.05);
}
/deep/.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: rgba(18, 138, 120, 0.05);
}
/deep/.el-input__suffix {
  .el-input__validateIcon {
    display: none;
  }
}
/deep/.el-select__tags {
  flex-wrap: nowrap;
}
</style>
