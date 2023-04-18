<script>
import { h } from 'vue';
import table from './table.vue';
import { appendFn } from '../../../utils/fp.js';
import tableProps from './tableProps';
import juggleTableSelectTotal from "./selectTotal.vue";

export default {
  name: 'juggle-selection-table',
  components: {juggleTableSelectTotal},
  emits: ['selectionChange'],

  props: {
    // 表格头配置数据
    ...tableProps,
    showTotal: Boolean, // 显示汇总
    selectable: { type: Function, default: null },
    reserveSelection: { type: Boolean, default: true },
    // 权限 code
    authCodes: { type: String, default: '' },
    showSelect: { type: Boolean, default: true },
  },
  data() {
    return {
      selectNum: 0,
    }
  },
  computed: {
    selectFixed() {
      let result = '';
      if (this.showSelect) {
        if (this.authCodes) {
          result = 'hide';
          if (this.authCodes.includes('||')) {
            const temp = this.authCodes.split(' || ');
            if (this.$sysConf.authCodes) {
              result = temp.some(code => this.$sysConf.authCodes[code]) ? '' : 'hide';
              return result;
            }
          }
          if (this.$sysConf.authCodes) {
            let tmp = this.authCodes.split(',');
            result = tmp.every(code => this.$sysConf.authCodes[code]) ? '' : 'hide';
          }
        }
      } else {
        result = 'hide';
      }
      return result;
    },
    selectionNode() {
      return {
        fixed: this.selectFixed,
        type: 'selection',
        selectable: this.selectable,
        'reserve-selection': this.reserveSelection,
        width: 54,
      };
    },
    columnsUse() {
      let result = this.columns;
      result = [this.selectionNode].concat(result);
      return result;
    },
    optionsUse() {
      let result = { ...this.options };
      let { tableProps } = result;
      if (!tableProps) {
        tableProps = {};
        result.tableProps = tableProps;
      }
      appendFn(tableProps, 'onSelectionChange', this.emitSelectionChange);
      return result;
    },
  },
  render() {
    const {$attrs, selectNum, clearSelection, showTotal} = this;
    let props = {};
    Object.keys(tableProps).forEach(key => {
      props[key] = this[key];
    });
    props.columns = this.columnsUse;
    props.options = this.optionsUse;
    const children = [];
    if (showTotal) {
      children.push(<juggle-table-select-total
        select-num={selectNum}
        onClear={clearSelection}
      ></juggle-table-select-total>);
    }
    children.push(h(table, { ref: 'tableRef', ...props, ...$attrs  }));
    return h('div', {class: 'juggle-selection-table'}, children);
  },
  methods: {
    emitSelectionChange(val) {
      this.selectNum = val?.length || 0;
      this.$emit('selectionChange', val);
    },
    toQuery() {
      return this.$refs.tableRef.toQuery();
    },
    query() {
      return this.$refs.tableRef.query();
    },
    clearSelection() {
      this.$refs.tableRef.clearSelection();
    },
    toggleRowSelection(row, selected) {
      this.$refs.tableRef.toggleRowSelection(row, selected);
    }
  },
};
</script>
