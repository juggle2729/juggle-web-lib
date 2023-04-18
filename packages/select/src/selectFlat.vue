<template>
  <el-popover ref="popover" placement="bottom" :width="180" :popper-class="'popover'" trigger="click" :disabled="disabledFlat">
    <template #reference>
      <el-select
        :disabled="disabledFlat"
        ref="select"
        size="small"
        @focus="onFocus"
        v-model="selectedData"
        multiple
        :placeholder="$t('sale.index.B01_01_0194')"
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
    <div v-if="chooseAll && treeDataList.length > 1">
      <el-checkbox
        :indeterminate="isIndeterminate"
        style="margin-left: 9px"
        v-model="checkALL"
        @change="checkALLChange"
      />
      <span style="margin-left: 8px">{{selectAllText}}</span>
    </div>
    <el-tree
      :data="treeDataList"
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
  name: 'juggle-select-flat',
  emits: ['selectChange', 'selectSearch'],
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
    disabledFlat: {
      type: Boolean,
      default: false,
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
    searchVal(val) {
      this.treeDataList = this.data.filter(item => {
        return item.dictValue.indexOf(val) !== -1;
      });
    },
    data: {
      handler(newObj) {
        this.handleData(newObj);
      },
      deep: true,
    },
  },
  data() {
    return {
      treeDataList: [],
      originOptions: [],
      oldData: [],
      allData: null,
      options: this.selectOptions,
      selectedData: this.selectedId || '',
      isIndeterminate: false,
      searchVal: '',
      checkALL: false,
      first: true,
      eventTimer: null,
      searchTimer: null
    };
  },
  methods: {
    // 重置
    reload() {
      if (this.disabledFlat)
        return false;
      this.options = [];
      this.selectedData = '';
      this.$refs.tree.setCheckedKeys([]);
      this.isIndeterminate = false;
      this.checkALL = false;
    },
    regetData() {
      this.first = true;
    },
    //树形数据扁平
    async treeData(source) {
      let res = [];
      function fn(treeDataList) {
        treeDataList.forEach(el => {
          res.push(el);
          el.children && el.children.length > 0 ? fn(el.children) : ''; // 子级递归
        });
      }
      fn(source);
      return res;
    },
    //判断全选-
    checkIsIndeterminate() {
      this.isIndeterminate = this.selectedData.length > 0 && this.selectedData.length < this.allData.length;
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
      if (this.selectedData.length > 0 && !this.isIndeterminate && this.treeDataList.length > 1) {
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
        this.$refs.tree.setCheckedNodes(this.treeDataList);
      } else {
        // 取消选中
        this.$refs.tree.setCheckedKeys([]);
      }
    },
    // 筛选
    nodeClick(treeDataList) {
      if (this.strictly) {
        this.options = [treeDataList].map(item => {
          let node = this.$refs.tree.getNode(item); // 所有被选中的节点对应的node
          let tmpMap = {};
          tmpMap.dictCode = node.key;
          tmpMap.dictValue = node.label;
          return tmpMap;
        });
        this.selectedData = [treeDataList.dictCode];
        this.$refs.tree.setCheckedNodes([treeDataList]);
        this.$refs.popover.hide();
        // 避免频繁触发事件
        if (this.eventTimer) {
          clearTimeout(this.eventTimer);
          this.eventTimer = null;
        }
        this.eventTimer = setTimeout(() => {
          this.$emit('selectChange', this.selectedData);
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
      if (val === '') {
        // 删除的是全部
        this.$refs.tree.setCheckedKeys([]);
      } else {
        this.$refs.tree.setChecked(val, false, true);
        let node = this.$refs.tree.getNode(val);
        if (node.childNodes.length > 0) {
          node.childNodes.map(item => {
            if (item.childNodes.length <= 0) {
              this.$refs.tree.setChecked(item, false, true);
            }
          });
          this.handleCheckChange();
        }
      }

      if (this.selectedData.length < 1) {
        this.checkALL = false;
        this.$nextTick(() => {
          // 删除全部标签的同时把搜索栏置为空
          this.searchVal = '';
          this.$emit('selectSearch', '');
        });
      } else {
        this.checkALL = true;
      }

      // 避免频繁触发事件
      if (this.eventTimer) {
        clearTimeout(this.eventTimer);
        this.eventTimer = null;
      }
      this.eventTimer = setTimeout(() => {
        this.checkIsIndeterminate();
        this.$emit('selectChange', this.selectedData);
      }, 500);
    },
    searchChange(e) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }
      this.searchTimer = setTimeout(() => {
        this.oldData = JSON.parse(JSON.stringify(this.treeDataList));
        this.$emit('selectSearch', e);
      }, 500);
    },
    //带搜索的数据处理
    processCheck() {
      let checkedKeys = this.$refs.tree.getCheckedKeys(); // 所有被选中的节点的 key 所组成的数组数据
      let checkoptions = checkedKeys.map(item => {
        let node = this.$refs.tree.getNode(item); // 所有被选中的节点对应的node
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
        let nowIds = this.treeDataList.map(item => {
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
      // 避免频繁触发事件
      if (this.eventTimer) {
        clearTimeout(this.eventTimer);
        this.eventTimer = null;
      }
      this.eventTimer = setTimeout(() => {
        this.checkIsIndeterminate();
        this.$emit('selectChange', this.selectedData);
      }, 500);
    },
    handleData(newObj) {
      if (!Array.isArray(newObj)) {
        return;
      }
      this.treeDataList = JSON.parse(JSON.stringify(this.data));
      if (this.first && newObj.length > 0) {
        this.allData = newObj;
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
  mounted() {
    if (this.data) {
      this.handleData(this.data);
    }
  },
};
</script>
<style lang="less" scoped>
.popover {
  max-height: 400px;
  overflow: scroll;
}
.el-tree {
  &::-webkit-scrollbar-thumb {
    background-color: #d9d9d9;
  }
  &::-webkit-scrollbar-track {
    background-color: #fff;
  }
}
/deep/.el-tree-node__label,
.el-tree-node__content {
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  display: inline-block;
}

/deep/.is-current,
.is-checked {
  background: rgba(18, 138, 120, 0.15);
}
/deep/ .el-tree-node {
  margin-left: -15px;
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
