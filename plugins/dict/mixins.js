export default {
  data() {
    return {
      // 是否使用字典
      useDict: false,
      dictList: [],
    };
  },
  computed: {
    $opts() {
      if (!this.useDict) throw new Error('请打开使用字典开关useDict');
      const list = this.dictList || [];
      return (dictType, hasAll) => {
        return this.$dict._opts(list, dictType, hasAll);
      };
    },
    $optsfp() {
      if (!this.useDict) throw new Error('请打开使用字典开关useDict');
      const list = this.dictList || [];
      return (parentDictType, parentCode, hasAll) => {
        return this.$dict._optsfp(list, parentDictType, parentCode, hasAll);
      };
    },
    $optsId() {
      if (!this.useDict) throw new Error('请打开使用字典开关useDict');
      const list = this.dictList || [];
      return parentId => {
        return this.$dict._optsByParentId(list, parentId);
      };
    },
    $optsCascader() {
      if (!this.useDict) throw new Error('请打开使用字典开关useDict');
      const list = this.dictList || [];
      return dictType => {
        return this.$dict._optsCascader(list, dictType);
      };
    },
    $optsCascaderId() {
      if (!this.useDict) throw new Error('请打开使用字典开关useDict');
      const list = this.dictList || [];
      return parentId => {
        return this.$dict._optsCascaderByParentId(list, parentId);
      };
    },
    $dictVal() {
      if (!this.useDict) throw new Error('请打开使用字典开关useDict');
      const list = this.dictList || [];
      return (dictType, dictCode) => {
        return this.$dict._getVal(list, dictType, dictCode);
      };
    },
  },
  created() {
    // 打开使用字典后，才可用
    if (this.useDict) {
      this._queryDictList();

      this.$watch(
        () => this.$i18n.locale,
        () => {
          this._queryDictList();
        }
      );
    }
  },
  methods: {
    _queryDictList(reset) {
      this.$dict._getList(this.$apis.oms.dict.index.listAll, { languageType: this.$i18n.locale }, reset).then(res => {
        this.dictList = res;
      });
    },
    // 取得对应dictType, dictCode的dictVal值
    getDictVal(dictType) {
      return dictCode => this.$dict._getVal(this.dictList, dictType, dictCode);
    },
  },
};
