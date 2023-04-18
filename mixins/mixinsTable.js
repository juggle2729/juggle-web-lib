export default {
  data() {
    return {
      tableLoading: false,
    };
  },
  methods: {
    /**
     * 表格加载状态变化
     * @param {*} value
     */
    onTableLoadingChange(value) {
      this.tableLoading = value;
    },
    /**
     * 查询一下
     */
    toQuery() {
      if (this.$refs.juggleTableRef) {
        this.$refs.juggleTableRef.toQuery();
      }
    },
    /**
     * 刷新表格当前页
     */
    toRefresh() {
      if (this.$refs.juggleTableRef) {
        this.$refs.juggleTableRef.query();
      }
    },
    /**
     * 取得筛选数据
     * @returns
     */
    getScreenData() {
      if (this.$refs.screenRef) {
        return this.$refs.screenRef.getFormData();
      }
      return {};
    },
  },
};
