import { h, resolveComponent } from 'vue';
import useColumns from './useColumns';

const tableDefaultProps = {
  ref: 'table',
  size: 'mini',
  'row-key': 'id',
};

export default function useTable(options, columns, listData, config, tableKey) {
  const { tableProps } = options;
  const tableBaseHeight = tableProps?.height;
  const tableBaseMaxHeight = tableProps?.maxHeight;
  const maxHeight = config.maxHeight ? config.maxHeight : '';
  const heightAuto = config.heightAuto;
  const inDialog = config.inDialog;
  const diaLogFullscreen = config.diaLogFullscreen;
  const showOverflowTooltip = config.showOverflowTooltip || false;
  const isTableV2 = config.isTableV2 || false;
  let showOperationMore = 0;
  if (config.showOperationMore === true || config.showOperationMore === '') {
    showOperationMore = 3;
  } else {
    showOperationMore = config.showOperationMore || 0;
  }
  const fixedBottomPagination = config.fixedBottomPagination || false;
  const tableColumnNodes = useColumns(columns, listData, showOverflowTooltip, showOperationMore);
  const children = {
    default: () => tableColumnNodes,
  };
  if (config.empty) {
    children.empty = config.empty;
  }
  /**
   * 计算maxHeight高度时 测试点
   * 1.弹框中高度200问题
   * 2.fixedBottomPagination 页码固定底部
   * 3.table 空数据高度
   */
  const style = {};
  if (
    (heightAuto &&
      !tableBaseHeight &&
      !tableBaseMaxHeight &&
      !inDialog &&
      !diaLogFullscreen &&
      !fixedBottomPagination) ||
    diaLogFullscreen
  ) {
    style.maxHeight = maxHeight;
  }
  if (
    (!isNaN(parseFloat(maxHeight)) &&
      maxHeight > 0 &&
      !tableBaseHeight &&
      !tableBaseMaxHeight &&
      !inDialog &&
      fixedBottomPagination) ||
    diaLogFullscreen
  ) {
    style.height = maxHeight;
  }
  const tableName = isTableV2 ? 'juggle-table-v2' : 'el-table';
  return h(
    'div',
    {
      class: 'simple-table_table-wrapper',
    },
    h(
      resolveComponent(tableName),
      // key 勿删否则vnode不更新
      { ...style, ...tableDefaultProps, ...tableProps, ref: 'tableRef', data: listData, key: tableKey },
      { ...children }
    )
  );
}
