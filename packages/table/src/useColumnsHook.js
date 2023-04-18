import { reactive, toRefs } from 'vue';
// interface config {
//    tableName: String,
//    getRequest: Function,
//    setRequest: Function,
// }
export const useColumnsHook = config => {
  const state = reactive(config);
  const checkcolProp = col => {
    col.forEach(item => {
      if (!item.prop) {
        throw new Error('Sorting depends on prop，columnProp must have');
      }
    });
  };
  const init = async col => {
    if (state.tableName) {
      if (!state.getRequest || !state.setRequest) {
        throw new Error('Must have arguments: tableName getRequest setRequest');
      }
      checkcolProp(col);
      const res = await _getOriginColumns();
      // 如果数据库没有
      if (res?.length === 0) {
        return col;
      }
      return sortColumns(col, res);
    }
    return col;
  };

  const reset = col => {
    const columnList = col.map((item, idx) => {
      return {
        key: item.prop,
        sort: idx,
        isShow: item.visible === undefined ? true : item.visible,
      };
    });
    _setOriginColumns({ columnList, tableName: state.tableName });
  };
  const change = col => {
    const columnList = col.map((item, idx) => {
      return {
        key: item.prop,
        sort: idx,
        isShow: item.visible,
      };
    });
    _setOriginColumns({ columnList, tableName: state.tableName });
  };
  const sortColumns = (col, orginCol) => {
    const arr = orginCol.sort((a, b) => a.sort - b.sort);
    return arr.map(item => {
      let I = col.find(c => c.prop === item.key);
      if (!I) {
        throw new Error(`prop:${I}${item}`);
      }
      const obj = Object.assign({}, I);
      obj.visible = item.isShow;
      return obj;
    });
  };
  const _getOriginColumns = async() => {
    return await state.getRequest({ tableName: state.tableName });
  };
  // interface params {
  //   key: string,
  //   sort: number,
  //   isShow: boolean
  // }
  const _setOriginColumns = params => {
    state.setRequest(params);
  };

  return {
    ...toRefs(state),
    reset,
    init,
    change,
  };
};
