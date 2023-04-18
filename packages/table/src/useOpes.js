import juggleButton from '../../button';
import authContainer from './authContainer.vue';
import jugglePopconfirm from '../../popConfirm';
import juggleDropdown from '../../dropDown';
import { h } from 'vue';
import { hasAuth } from '@/common/utils/index.js';
/**
 * 将字符串数据转换为{ type:'text', title:data } 格式数据
 * @param {*} data
 * @returns
 */
const parseItem = data => {
  const types = typeof data;
  if (types === 'string') {
    return { type: 'text', title: data };
  }
  return data;

};

export default function useOpes(scope, opes, showOperationMore) {
  // 若为函数,执行函数,取得函数返回值
  if (typeof opes == 'function') {
    opes = opes.call(null, scope);
  }

  if (!Array.isArray(opes)) {
    // 转换为数组
    opes = [parseItem(opes)];
  }

  const tempOps = [];

  let opeNodes = opes.map((item, index) => {
    // 转换为对象格式
    item = parseItem(item);
    /**
     * type:类型，目前有 text(文本) button(按钮) popconfirm(气泡确认框),默认为button
     * title:文本或按钮内容
     * popconfirmProps: 气泡确认框配置
     * key:一个key值
     * onClick: 按钮
     * onCheck: 前置条件验证，满足才显示气泡框
     */
    const { type = 'button', title, key, onClick, onCheck, authCode, showAll, props, popconfirmProps, disabled, render } = item;
    let nodeProps = {
      onClick: evt => {
        if (onClick) {
          onClick.call(null, evt, scope, key);
        }
      },
      onCheck: evt => {
        if (onCheck) {
          onCheck.call(null, evt, scope, key);
        } else {
          // 不需要前置条件判断时直接显示气泡框
          evt(true);
        }
      },
    };

    let disabledFun = evt => {
      if (disabled) {
        return disabled.call(null, evt, scope, key);
      }
    };

    const btnStyle = index === 0 ? 'margin-right:10px' : 'margin:0 10px';
    const renderButton = () => {
      if (type == 'text') {
        nodeProps = { authCode, showAll, style: btnStyle, ...props, ...nodeProps, disabled: disabledFun() };
        return h('span', nodeProps, title);
      } else if (type == 'popconfirm') {
        nodeProps = {
          title,
          authCode,
          showAll,
          props: { type: 'text', size: 'mini', ...props },
          popconfirmProps: { confirmButtonType: 'text', placement: 'top', ...popconfirmProps, disabled: disabledFun() },
          ...nodeProps,
        };
        return h('span', { style: btnStyle }, h(jugglePopconfirm, nodeProps));
      } else if (type === 'render') {
        return h(authContainer, { authCode, showAll }, [render(h, item)]);
      }
      nodeProps = { title, authCode, showAll, type: 'text', size: 'mini', ...props, ...nodeProps, disabled: disabledFun() };
      return h(juggleButton, nodeProps);
    };

    if (showOperationMore) {
      const opesLength = opes.filter(item => hasAuth(item.authCode)).length;
      // 支持折叠的情况
      if (opesLength > showOperationMore && index >= showOperationMore) {
        if (opesLength === showOperationMore + 1) {
          return renderButton();
        }
        // 收集需要折叠的按钮
        nodeProps = { title, authCode, showAll, type: 'text', size: 'mini', ...props, ...nodeProps, disabled: disabledFun() };
        tempOps.push(nodeProps);
        if (index === showOperationMore) {
          return h(juggleDropdown, { tempOps });
        }
      } else {
        // 渲染出不需要折叠的按钮
        return renderButton();
      }
    } else {
      // 非折叠情况下渲染按钮
      return renderButton();
    }
  });
  // 折叠情况下不换行
  const className = showOperationMore ? 'table-ctrl-btn-nowrap' : 'table-ctrl-btn';
  return h('div', { class: className }, opeNodes);
}
