// const defaultConfig = {
//     show: true, // 是否显示 默认显示
//     title: '', // 全程文案唯一
//     tip: '', // 全程文案唯一
//     addAction: '', // 传了这个action 添加按钮全程显示
//     render: '',// 全程唯一
//
//     firstTitle: '您还没添加任何内容',
//     firstTip: '',
//     firstAddAction: '',
//     firstRender: '',
//
//     searchTitle: '未找到您查询的内容',
//     searchTip: '',
//     searchAddAction: '',
//     searchRender: '',
// };
import { i18n } from '@/i18n';
const { t } = i18n.global;
export default function useEmpty(instance, emptyConfig, isFirst, height, width) {
  let {
    show = true,
    addAction,
    addAuthCode,
    title = t('systemManager.userPermission.E01_03_0054'),
    tip,
    render,
    firstTitle,
    firstTip,
    firstRender,
    firstAddAction,
    searchTitle,
    searchTip,
    searchAddAction,
    searchRender,
    showEmptyImg = true,
  } = emptyConfig;
  if (!show) {
    return '';
  }
  if (!showEmptyImg) {
    return <div class="empty-box in-detail">{title}</div>;
  }
  const hasAuth = code => {
    if (!code) return true;
    if (!instance.$sysConf.code) return false;
    return instance.$sysConf.authCodes[code];
  };
  title = (isFirst ? firstTitle : searchTitle) || title;
  tip = tip || (isFirst ? firstTip : searchTip);
  addAction = (hasAuth(addAuthCode) && (addAction || (isFirst ? firstAddAction : searchAddAction))) || '';
  render = render || (isFirst ? firstRender : searchRender);
  const titleRender = (title && <div class="empty-title">{title}</div>) || '';
  const tipRender = (hasAuth(addAuthCode) && tip && <div class="tip">{tip}</div>) || '';
  const addBtnRender = (addAction && <div onClick={addAction} class="add-btn"></div>) || '';
  const renderFun = (render && render()) || (
    <div className="empty-content">
      {titleRender}
      {tipRender}
    </div>
  );
  const emptyClass = ['empty-box ', isFirst ? '' : 'is-search'];

  const style = {};
  if (height) {
    style.height = `${height}px`;
  }
  if (width) {
    style.width = `${width}px`;
  }

  return (
    <div class={emptyClass} style={style}>
      <div class="list-empty">{addBtnRender}</div>
      {renderFun}
    </div>
  );
}
