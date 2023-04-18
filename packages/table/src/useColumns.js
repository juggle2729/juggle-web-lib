/* eslint-disable camelcase */
import { h, resolveComponent } from 'vue';
import columnsFilter from './columnFilter.vue';
import { isEmptyObj } from '../../../utils/base';
import { formatDateOverSea } from '../../../utils/date';
import useOpes from './useOpes';
import { renderTooltipBox } from './useTooltip';
const columnDefaultProps = {
  // 'show-overflow-tooltip': true,
};
export default function useColumns(columns, listData, showOverflowTooltip, showOperationMore) {
  const columnConfList = columns || [];
  // 是否有内容
  const hasContent = listData.length > 0;
  return columnConfList.map(columnConf => {
    let { render, filter, opes, renderHeader, fixed, isTime, isImage, imageStyle, isShowAll, ...rest } = columnConf;
    let {
      showOverflowTooltip: cellShowOverflowTooltip,
      childrenColumns,
      ...columnProps
    } = { showOverflowTooltip, ...columnDefaultProps, ...rest };
    // 列表为空时，移除fixed属性
    if (hasContent) columnProps.fixed = fixed;

    // 针对宽度处理
    autoWidth(columnProps, { isTime, isImage, listData, isShowAll });

    if (isImage) {
      render = scope => {
        let url = scope.row[columnProps.prop];
        if (!url) return '';
        let style = { width: '100px', height: '100px' };
        if (imageStyle) {
          style = { ...style, ...imageStyle };
        }
        return <el-image fit="cover" style={style} src={url} preview-src-list={[url]}></el-image>;
      };
    }
    // 是时间列
    if (isTime) {
      filter = val => formatDateOverSea(val);
    }

    let slots = {};
    if (render) {
      slots.default = scope => render(scope);
    } else if (filter) {
      slots.default = scope => {
        let val = columnProps.prop;
        let sep = columnProps.splitChar;
        return h(columnsFilter, { val, filter, sep, scope });
      };
      /*
       * slots.default = scope => {
       *   const { row } = scope;
       *   let prop = columnProps.prop;
       *   let splitChar = columnProps.splitChar || '-';
       *   // 多个时间显示问题
       *   prop = prop.split(',');
       */

      /*
       *   return <span>{prop.map(val => filter(row[val], row, scope)).join(splitChar)}</span>;
       * };
       */
    } else if (opes) {
      slots.default = scope => useOpes(scope, opes, showOperationMore);
    }

    if (renderHeader) {
      slots.header = scope => renderHeader(scope);
    }

    if (columnConf.type !== 'selection' && columnConf.type !== 'index') {
      const baseRender = scope => {
        if (scope.row !== undefined && columnProps.prop !== undefined) {
          // 增加空值判断并返回【-】
          const val = scope.row[columnProps.prop];
          if (val === null || val === '') {
            return '-';
          }
          return scope.row[columnProps.prop];
        }
        return '';
      };
      const defaultRender = slots.default ? slots.default : baseRender;
      if (cellShowOverflowTooltip) {
        slots.default = scope => renderTooltipBox(scope, defaultRender);
      } else {
        slots.default = defaultRender;
      }
    }

    if (childrenColumns?.length > 0) {
      slots.default = () => useColumns(childrenColumns, listData, cellShowOverflowTooltip);
    }

    if (isEmptyObj(slots)) {
      slots = null;
    }
    columnProps.key = `${columnProps.label}${columnProps.prop}${columnProps.key}`;
    return h(resolveComponent('el-table-column'), columnProps, slots);
    // return buildRenderFunction(columnConf, hasContent, showOverflowTooltip);
  });
}

/**
 * 构建渲染函数
 * @param columnInfo 列配置
 * @param hasContent
 * @returns {*}
 */
/*
 *function buildRenderFunction(columnInfo, hasContent, showOverflowTooltip) {
 *let { render, filter, opes, renderHeader, fixed, isTime, isImage, isThousands, action, status, imageStyle, ...rest } =
 *  columnInfo;
 *let columnProps = { showOverflowTooltip, ...columnDefaultProps, ...rest };
 * // 列表为空时，移除fixed属性
 *if (hasContent) columnProps.fixed = fixed;
 *
 * // 针对宽度处理
 *autoWidth(columnProps, { isTime, isImage });
 *
 *const emptyStrToLine = str => (isEmptyStr(str) ? '-' : str);
 *
 * // baseRender
 *const baseRender = scope => emptyStrToLine(scope.row[columnProps.prop]);
 *
 * // 图片渲染
 *const imgRender = (scope, column) => {
 *  let url = scope.row[column.prop];
 *  if (!url) return '-';
 *  let style = {width: '100px', height: '100px'};
 *  if (imageStyle) {
 *    style = {...style, ...imageStyle};
 *  }
 *  return <el-image
 *    fit="cover"
 *    style={style}
 *    src={url}
 *    preview-src-list={[url]}></el-image>;
 *};
 *
 * // 时间渲染
 *const timeRender = scope => {
 *  return filterRender(scope, val => formatDate(val));
 *};
 *
 * // 过滤器渲染
 *const filterRender = (scope, filterFun = filter) => {
 *  let val = columnProps.prop;
 *  let sep = columnProps.splitChar;
 *  return h(columnsFilter, { val, filter, sep, scope });
 *  // const { row } = scope;
 *  // let prop = columnProps.prop;
 *  // let splitChar = columnProps.splitChar || '-';
 *  // // 多个时间显示问题
 *  // prop = prop.split(',');
 *  // const str = prop.map(val => filterFun(row[val], row, scope)).join(splitChar);
 *  // return <span>{emptyStrToLine(str)}</span>;
 *};
 *
 * // 带有action的列渲染
 *const actionRender = scope => {
 *  if (isEmptyStr(scope.row[columnProps.prop])) {
 *    return '-';
 *  }
 *  const actionFun = action || (() => {});
 *  return (
 *    <span class="juggle-table-action" onClick={() => actionFun(scope, columnProps)}>
 *      {baseRender(scope)}
 *    </span>
 *  );
 *};
 *
 * // 带有status 进行中：doing 完成：success 异常警告：error 未开始：info
 *const statusRender = scope => {
 *  const str = scope.row[columnProps.prop];
 *  if (isEmptyStr(str)) {
 *    return '-';
 *  }
 *  const classList = ['juggle-table-status'];
 *  classList.push(status);
 *  return <span class={classList.join(' ')}>{filter ? filterRender(scope) : str}</span>;
 *};
 *
 * // 千分位
 *const thousandsRender = scope => {
 *  const str = scope.row[columnProps.prop];
 *  if (isEmptyStr(str)) {
 *    return '-';
 *  }
 *  if (isNaN(parseFloat(str))) {
 *    return str;
 *  }
 *  return str.toLocaleString();
 *};
 * // 操作按钮渲染
 *const ctrlBtnRender = scope => useOpes(scope, opes);
 *
 *let defaultRender = null;
 *if (render) {
 *  // 有渲染函数
 *  defaultRender = render;
 *} else if (isTime) {
 *  // 时间渲染
 *  defaultRender = timeRender;
 *} else if (isImage) {
 *  // 图片渲染
 *  defaultRender = scope => imgRender(scope, columnProps);
 *} else if (status) {
 *  // 状态点 渲染
 *  defaultRender = statusRender;
 *} else if (filter) {
 *  // 过滤器渲染
 *  defaultRender = filterRender;
 *} else if (opes) {
 *  // 操作按钮渲染
 *  defaultRender = ctrlBtnRender;
 *} else if (isThousands) {
 *  // 千分位渲染
 *  defaultRender = thousandsRender;
 *} else if (!columnProps.type) {
 *  // 默认渲染 为空自动填充'-'
 *  defaultRender = baseRender;
 *}
 *if (action) {
 *  defaultRender = actionRender;
 *}
 *let slots = {};
 * // console.log(type, defaultRender?.toString());
 *if (defaultRender) {
 *  slots.default = defaultRender;
 *} else if (['selection', 'index', 'expand'].indexOf(columnProps.type) === -1) {
 *  slots.default = () => scope => {
 *    const { row } = scope;
 *    const str = row[columnProps.prop];
 *    return isEmptyStr(str) ? '-' : str;
 *  }
 *}
 *if (renderHeader) {
 *  slots.header = scope => renderHeader(scope);
 *}
 *if (isEmptyObj(slots)) {
 *  slots = null;
 *}
 *columnProps.key = `${columnProps.label}${columnProps.prop}${columnProps.key}`;
 *return h(resolveComponent('el-table-column'), columnProps, slots);
 *}
 */

/**
 * 针对width的处理
 * @param {*} target
 */
function autoWidth(target, { isTime, isImage, listData, isShowAll }) {
  if (!target.label) return;
  if (isTime) {
    target.minWidth = 200;
    return;
  }
  if (isImage) {
    target.minWidth = 124;
    return;
  }
  let { width, minWidth, label, prop } = target;
  if (!width && !minWidth) {
    // minWidth = label.length * itemWidth;
    // if (minWidth < defaultMinWidth) minWidth = defaultMinWidth;
    // target.minWidth = minWidth;
    // 不设置宽度时 根据表头 显示长度来设置最小宽度
    const font = '500 24px PingFang SC';
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const textwidth = context.measureText(label).width;
    target.minWidth = textwidth;
  }
  if (listData.length && isShowAll) {
    const widthItem = flexColumnWidth(prop, listData);
    target.width = widthItem;
  }
}

function flexColumnWidth(str, tableData) {
  let columnContent = '';
  if (!str || typeof str != 'string') return;
  let index = 0;
  for (let i = 0; i < tableData.length; i++) {
    const now_temp = tableData[i][str] + '';
    const max_temp = tableData[index][str] + '';
    if (now_temp.length > max_temp.length) {
      index = i;
    }
  }
  columnContent = tableData[index][str];
  if (!columnContent) return;
  let flexWidth = 0;
  for (const char of columnContent) {
    if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
      flexWidth += 10;
    } else if (char >= '\u4e00' && char <= '\u9fa5') {
      flexWidth += 16;
    } else {
      flexWidth += 10;
    }
  }
  if (flexWidth < 80) {
    flexWidth = 80;
  }
  return flexWidth + 'px';
}
