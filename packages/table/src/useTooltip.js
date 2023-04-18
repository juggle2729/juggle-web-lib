import { h } from 'vue';
import { createPopper } from '@popperjs/core';

let contentNode = null;
let popperIns = null;

function createPopover(cellNode) {
  if (!cellNode) {
    return;
  }
  function renderContent() {
    const isLight = false;
    const content = document.createElement('div');
    content.className = `el-popper ${isLight ? 'is-light' : 'is-dark'}`;
    content.style.zIndex = '9999';
    document.body.appendChild(content);
    return content
  }
  function renderArrow() {
    const arrow = document.createElement('div')
    arrow.className = 'el-popper__arrow'
    arrow.style.bottom = '-4px'
    return arrow;
  }
  const contentTextBox = document.createElement('div');
  contentNode = renderContent();
  const arrow  = renderArrow();
  contentNode.appendChild(contentTextBox)
  contentNode.appendChild(arrow)
  contentTextBox.innerText = cellNode.innerText;
  return createPopper(cellNode, contentNode, {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
      {
        name: 'arrow',
        options: {
          element: arrow,
          padding: 10,
        },
      },
    ],
    placement: 'top',
    strategy: 'fixed',
  });
}
const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}
const getStyle = function(element, styleName) {
  if (!element || !styleName) return ''
  styleName = camelize(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    const style = element.style[styleName]
    if (style) return style
    const computed = document.defaultView?.getComputedStyle(element, '')
    return computed ? computed[styleName] : ''
  } catch (e) {
    return element.style[styleName]
  }
}
function mouseenter(e) {
  popperIns && popperIns.destroy();
  const cellChild = e.target;
  const range = document.createRange()
  range.setStart(cellChild, 0)
  range.setEnd(cellChild, cellChild.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width
  const padding =
    (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
    (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0)
  if (
    rangeWidth + padding > cellChild.offsetWidth ||
    cellChild.scrollWidth > cellChild.offsetWidth
  ) {
    popperIns = createPopover(e.target);
  }
}
function mouseleave() {
  popperIns && popperIns.destroy();
  contentNode && document.body.removeChild(contentNode);
  contentNode = undefined;
  popperIns = undefined;
}
export const renderTooltipBox = (scope, defaultRender) => {
  return h('div',
    {
      class: ['tooltip-text-over-nowrap'],
      onMouseenter: mouseenter,
      onMouseleave: mouseleave,
      onMouseup: mouseleave
    }, defaultRender(scope)
  );
}
