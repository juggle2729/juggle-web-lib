<script>
import { ref, reactive, h, toRefs, onMounted, watch, watchEffect, computed, nextTick, getCurrentInstance } from 'vue';
import usePagination from './usePagination';
import useTable from './useTable';
import useEmpty from './useEmpty';
import tableProps from './tableProps';
import juggleFilterTooltip from './filterTooltip.vue';
import juggleFilterTooltip2 from './filterTooltip2.vue';
import juggleTableBtnGroup from './buttonGroup/index.vue';
import { useColumnsHook } from './useColumnsHook.js';
import { uniqueId } from 'lodash';
export default {
  name: 'juggle-table',
  components: { juggleTableBtnGroup, juggleFilterTooltip, juggleFilterTooltip2 },
  emits: ['loadingChange', 'queryChange', 'queryTotal', 'beforeQuery'],
  props: tableProps,
  setup(props, { emit }) {
    // 请求次数
    const queryCount = ref(0);
    // console
    const tableRef = ref(null);
    const tableKey = ref(null);
    // 列选中
    const selectList = ref(null);
    const loading = ref(false);
    const listData = ref([]);
    const backupListData = ref([]);
    const {
      appContext: {
        config: { globalProperties },
      },
    } = getCurrentInstance();
    const { list, showOverflowTooltip, isTableV2, showOperationMore, diaLogFullscreen, allText } = toRefs(props);
    const { init, reset } = useColumnsHook(props.config);
    // updateList();
    const pageProps = props.options?.pageProps || {};
    const pager = reactive({ pageable: {}, listQuery: { pageNum: 1, pageSize: 20, ...pageProps } });

    const updateList = () => {
      if (!props.queryApi) {
        listData.value = list.value;
        pager.pageable.total = list.value.length;
      }
    };

    // updateList();

    /** 发送数据请求状态变化loadingChange事件 */
    const emitQueryStatus = value => {
      loading.value = value;
      emit('loadingChange', value);
    };

    /** 发送数据请求之前的 beforeQuery 事件 */
    const emitBeforeQuery = () => {
      emit('beforeQuery', pager.listQuery);
    };
    /** 发送数据请求变化queryChange事件 */
    const emitListChange = () => emit('queryChange', { listData: listData.value, pageable: pager.pageable });
    /**
     * 请求数据的数据量,用于父级根据数据量判断状态
     */
    const emitQueryTotal = value => emit('queryTotal', value);
    /** 请求数据 */
    const query = () => {
      if (!props.queryApi && props.isWebPage && props.list) {
        pager.pageable.pageSize = pager.listQuery.pageSize;
        pager.pageable.total = props.list.length;
        backupListData.value = props.list.slice();
        dataSlice();
      }
      if (!props.queryApi) return;
      let params = props.queryParams || {};
      if (typeof params === 'function') {
        params = params();
      }
      if (!props.hidePage) {
        params = { ...pager.listQuery, ...params };
      }

      emitBeforeQuery();
      emitQueryStatus(true);
      return props
        .queryApi(params)
        .then(res => {
          const { records, total, ...pageable } = res;
          pager.pageable = { ...pager.listQuery, ...pageable };
          pager.pageable.total = +total;
          emitQueryTotal(pager.pageable.total);
          if (!props.isWebPage) {
            if (params.pageNum > 1 && records != undefined && !records.length) {
              pager.listQuery.pageNum -= 1;
              query();
            }
            return (listData.value = records.slice());
          }
          backupListData.value = records.slice();
          dataSlice();
        })
        .catch(() => {
          listData.value = [];
          pager.pageable = { pageNum: 1, total: 0 };
          emitQueryTotal(0);
        })
        .finally(() => {
          emitQueryStatus(false);
          emitListChange();
          queryCount.value++;
        });
    };
    // 重置列表数据
    const resetList = () => {
      listData.value = [];
      pager.pageable = { pageNum: 1, total: 0 };
      emitQueryTotal(0);
      queryCount.value = 0;
    };
    // 获取列表数据
    const getData = () => {
      emit('getData', listData.value);
    };

    /** 查询一下 */
    const toQuery = (isRetsetPage = true) => {
      if (loading.value) return Promise.resolve();
      pager.listQuery.pageNum = isRetsetPage ? 1 : pager.listQuery.pageNum;
      return query();
    };
    //清除多选框
    const clearSelection = () => {
      tableRef.value.clearSelection();
    };
    // 取消行选中状态
    const toggleRowSelection = (row, selected) => {
      tableRef.value.toggleRowSelection(row, selected);
    };
    /** 多选 */
    const multiSelect = rows => {
      if (!rows) {
        tableRef.value.clearSelection();
      } else {
        if (!tableRef.value) {
          if (!selectList.value) selectList.value = [];
          selectList.value = [...selectList.value, ...rows];
        } else {
          rows.forEach(row => {
            tableRef.value.toggleRowSelection(row);
          });
        }
      }
    };

    const pagiDefListener = {
      onSizeChange: val => {
        pager.listQuery = { pageSize: val, pageNum: 1 };
        if (props.isWebPage) {
          pager.pageable.pageNum = 1;
          pager.pageable.pageSize = val;
        }
        isQuery();
      },
      onCurrentChange: val => {
        const pageNum = parseInt(val);
        pager.listQuery.pageNum = pageNum;
        pager.pageable.pageNum = pageNum;
        isQuery();
      },
    };

    const isQuery = () => {
      if (props.isWebPage) return dataSlice();
      query();
    };
    const dataSlice = () => {
      const { pageNum, pageSize } = pager.listQuery;
      listData.value = backupListData.value.slice((pageNum - 1) * pageSize, pageNum * pageSize);
    };

    // 请求列表数据
    // 是否已经初始化请求了
    const hasInitQuery = ref(false);
    if (props.isNeedQuery) {
      onMounted(() => {
        nextTick(() => (hasInitQuery.value = true));
        if (props.isNeedQueryActivated) query();
      });
    }
    if (props.options.selectList) {
      onMounted(() => {
        multiSelect(props.options.selectList);
      });
    }
    // 监听传入的list变化
    watchEffect(updateList);

    /** 初始化表格高度 **/
    const tableHeadHeight = ref(42);
    const tableMaxHeight = ref(0);
    const inDialog = ref(true);
    const tableWidth = ref(0);
    const tableNode = ref(null);
    const paginationHeight = computed(() => {
      return props.hidePage || !listData.value.length ? 0 : 49;
    });
    const getTableHeight = () => {
      nextTick(() => {
        const { otherHeight, heightAuto } = toRefs(props);
        const $el = tableNode.value;
        const pageScrollTop = document.documentElement?.scrollTop || document.body?.scrollTop;
        const tableOffsetTop = pageScrollTop + ($el?.getBoundingClientRect()?.top || $el?.offsetTop);
        const windowHeight = window.innerHeight;
        let paddingTop = $el ? parseFloat(window.getComputedStyle($el).getPropertyValue('padding-top')) : 16;
        paddingTop = isNaN(paddingTop) ? 16 : paddingTop;
        const footerHeight = !diaLogFullscreen.value ? 0 : paginationHeight.value ? 32 : 48;
        let height = 0;
        if (heightAuto.value) {
          height =
            windowHeight - (tableOffsetTop + paginationHeight.value + otherHeight.value + paddingTop + footerHeight);
        }
        tableMaxHeight.value = height;
      });
    };
    onMounted(() => {
      getTableHeight();
    });
    watch(() => listData.value, getTableHeight);
    watch(() => globalProperties?.$sysConf?.authCodes, getTableHeight);
    watch(() => globalProperties?.$store?.state?.isSearchFoldChange, getTableHeight);

    const maxTableHeight = computed(() => {
      const { options } = toRefs(props);
      // 弹窗不计算高度maxHeight  用户填写了  maxHeight或height也不计算
      if (
        (inDialog.value && !diaLogFullscreen.value) ||
        options.value.tableProps?.maxHeight ||
        options.value.tableProps?.height
      ) {
        return '';
      }
      return tableMaxHeight.value < 200 ? 200 : tableMaxHeight.value;
    });

    /** 表头 **/
    const tableHeadState = reactive({
      tableHeadVisibleList: [],
      tableHeaderOption: [],
    });
    const getColumnKey = item => {
      return `${item.label}-${item.prop || ''}`;
    };
    const resetHandle = () => {
      initColumns(props.columns);
      reset(props.columns);
    };
    const initColumns = col => {
      const list = col.map(item => ({
        prop: item.prop,
        label: item.label,
        value: getColumnKey(item),
        disabled: item.disabled || false,
        visible: item.visible === undefined ? true : item.visible,
      }));
      if (props.firstfilterTableHeader) {
        tableHeadState.tableHeaderOption = list.filter(item => item.label);
      } else {
        tableHeadState.tableHeaderOption = list;
      }
      tableHeadState.tableHeadVisibleList = list
        .filter(item => item.visible === undefined || item.visible)
        .map(item => item.value);
    };
    watchEffect(() => {
      init(props.columns).then(newCol => {
        initColumns(newCol);
      });
    });

    return {
      tableRef,
      pagiDefListener,
      loading,
      pager,
      listData,
      emitQueryStatus,
      query,
      resetList,
      toQuery,
      multiSelect,
      clearSelection,
      maxTableHeight,
      queryCount,
      tableHeadHeight,
      paginationHeight,
      tableNode,
      inDialog,
      showOverflowTooltip,
      diaLogFullscreen,
      showOperationMore,
      isTableV2,
      tableWidth,
      toggleRowSelection,
      getColumnKey,
      ...toRefs(tableHeadState),
      getTableHeight,
      // 处理 mounted/activated列表接口请求两次的问题
      hasInitQuery,
      getData,
      allText,
      resetHandle,
      tableKey,
    };
  },
  mounted() {
    this.initInDialog();
    this.initTableLayout();
    this.addListener();
  },
  activated() {
    // 需要查询 且 在 activated 下请求 且 是否已经完成了初始化请求
    if (this.isNeedQuery && this.isNeedQueryActivated && this.hasInitQuery) {
      this.query();
    }
    this.addListener();
  },
  deactivated() {
    this.removeListener();
  },
  beforeUnmount() {
    this.removeListener();
  },
  methods: {
    addListener() {
      this.removeListener();
      window.addEventListener('resize', this.initTableLayout);
    },
    removeListener() {
      window.removeEventListener('resize', this.initTableLayout);
    },
    initTableLayout() {
      this.$nextTick(() => {
        // 获取表格宽度
        this.tableWidth = this.$el?.clientWidth || this.$el?.getBoundingClientRect()?.width;
        this.getTableHeight();
      });
    },
    initInDialog() {
      // 判断是否在弹框中
      let parent = this.$parent;
      while (parent && parent.$options?.name !== 'ElOverlay') {
        parent = parent.$parent;
      }
      this.inDialog = parent?.$options?.name === 'ElOverlay';
    },
    refresh() {
      this.tableKey = uniqueId('juggle');
      // this.$nextTick(() => {
      //   this.$forceUpdate()
      // })
    },
  },
  watch: {
    listData(val) {
      if (!val?.length) {
        this.$nextTick(() => {
          this.tableWidth = this.$el?.clientWidth || this.$el?.getBoundingClientRect()?.width;
        });
      }
    },
  },
  computed: {
    emptyHeight() {
      const maxTableHeight = this.maxTableHeight;
      const listIsEmpty = this.listIsEmpty;
      const listCount = this.listData.length;
      if (maxTableHeight <= 0 || isNaN(parseFloat(maxTableHeight))) {
        return null;
      }
      if (listCount) {
        return null;
      }
      if (listIsEmpty) {
        return maxTableHeight - 42;
      }
      return null;
    },
    visibleColumns() {
      return this.tableHeadVisibleList.map(item => {
        return this.columns.find(key => this.getColumnKey(key) === item);
      });
    },
    listIsEmpty() {
      return (this.queryCount > 0 || !this.queryApi) && !this.listData.length;
    },
  },
  render() {
    const children = [];
    const config = {
      maxHeight: this.maxTableHeight,
      showOverflowTooltip: this.showOverflowTooltip,
      showOperationMore: this.showOperationMore,
      isTableV2: this.isTableV2,
      fixedBottomPagination: this.fixedBottomPagination,
      heightAuto: this.heightAuto,
      inDialog: this.inDialog,
      diaLogFullscreen: this.diaLogFullscreen,
      allText: this.allText,
    };

    // render empty
    if (this.listIsEmpty) {
      config.empty = () => useEmpty(this, this.emptyConfig, false, this.emptyHeight, this.tableWidth);
    }

    if (this.queryCount === 0) {
      config.empty = () => useEmpty(this, this.emptyConfig, true, this.emptyHeight, this.tableWidth);
    }

    // render table
    children.push(useTable(this.options, this.visibleColumns, this.listData, config, this.tableKey));

    // render pagination
    if (!this.hidePage && this.listData.length) {
      children.push(usePagination(this.options, this.pager.pageable, this.pagiDefListener));
    }
    if (this.filterTableHeader || this.config?.tableName) {
      const allText = this.allText || '表头展示';
      if (this.config?.tableName) {
        children.push(
          <juggle-filter-tooltip2
            allText={allText}
            vModel={this.tableHeadVisibleList}
            options={this.tableHeaderOption}
            config={this.config}
            onReset={this.resetHandle}
            onRefresh={this.refresh}
          ></juggle-filter-tooltip2>
        );
      } else {
        children.push(
          <juggle-filter-tooltip
            allText={allText}
            vModel={this.tableHeadVisibleList}
            options={this.tableHeaderOption}
          ></juggle-filter-tooltip>
        );
      }
    }
    const tableClass = ['simple-table'];
    if (this.listIsEmpty) {
      tableClass.push('is-empty');
      if (this.options?.tableProps?.height) {
        tableClass.push('set-height');
      }
    }
    return h('div', { class: tableClass, ref: 'tableNode' }, children);
  },
};
</script>

<style lang="less">
@import '../assets/less/table';
</style>
