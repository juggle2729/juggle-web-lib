# juggle-table

> juggle-table 是基于 el-table 二次封装的之前 el-table 的属性和方法

## props

```javascript
{
    // 表格头配置数据
  /**
   * childrenColumns 子项列表
   * [
   *  {label: '父亲',childrenColumns:[{label: '孩子'}]}
   * ]
   */
    columns: { type: Array, default: () => [] },
    // 表格数据
    list: { type: Array, default: () => [] },
    // 是否隐藏分页
    hidePage: { type: Boolean, default: false },

    // 列表数据请求接口函数
    queryApi: { type: Function },
    /** 列表数据请求接口需要的参数
    * 为Function时，取得函数返回值，返回值必须为对象
    * 为Object时，作为queryApi函数的参数
    */
    queryParams: { type: [Function, Object], default: () => ({}) },
    // 是否需要请求数据
    isNeedQuery: { type: Boolean, default: true },
    // 是否前端分页
    isWebPage: { type: Boolean, default: false },
    // // 是否需要请求数据
    // isNeedQuery: { type: Boolean, default: true },
    // heightAuto 自动计算表格高度,使页面滚动条在表格内 添加maxHeight此属性失效
    heightAuto: {type: Boolean, default: true},
    // 页码以下其他部分的高度
    otherHeight: {type: [Number], default: 36},
    // 页码固定在页面底部 高度会固定为页面剩余高度，详情页面慎用
    fixedBottomPagination: {type: Boolean, default: false},
    /**
    * emptyConfig 默认空状态
    * {
    *     show: true, // 是否显示 默认显示
    *
    *     // 传了这里参数 同时传如的 first 和 search 将无效
    *     title: '', // 全程文案唯一
    *     tip: '', // 全程文案唯一
    *     addAuthCode: '',添加按钮权限
    *     addAction: '', // 传了这个action 添加按钮全程显示
    *     render: '',// 全程唯一
    *
    *     // first 首次空展示的页面
    *     firstTitle: '您还没添加任何内容',
    *     firstTip: '',
    *     firstAddAction: '',
    *     firstRender: '',
    *
    *     // search 搜索空展示的空
    *     searchTitle: '未找到您查询的内容',
    *     searchTip: '',
    *     searchAddAction: '',
    *     searchRender: '',
    * }
    */
    emptyConfig: {
        type: Object,
        default: () => ({})
    },
    /**
    * 筛选表头 表头变化处罚 tableHeaderChange
    * columns: [{
    *    disabled: true, 是否可操作
    *    visible: false 初始是否显示
    * }]
    */
    filterTableHeader: Boolean,
    // 当内容过长被隐藏时显示 tooltip
    showOverflowTooltip: Boolean,

    /**
    * 相关配置参数
    * tableProps(object):el-table相关参数事件传入
    * pageProps(object):el-pagination相关参数事件传入
    *
    */
    options: { type: Object, default: () => ({}) },
  }
```

## Methods

可以通过 ref 调用 el-table 的方法

```vue
toQuery // 触发queryApi查询请求 clearSelection // 情况多选
```

## Events

可以在 options 的 tableProps 中监听 el-table 的事件

```vue
loadingChange 加载状态变化 参数列表list queryChange 发送数据请求变化queryChange事件 参数{ tableList, pageable }
```

# juggle-selection-table

> 多选表格基于 juggle-table 再次封装

## props

```vue
props: { // juggle-table表格头配置数据 ...tableProps, showTotal: Boolean,// 显示汇总 selectable: { type: Function,
default: null }, // selection列同el-table的selectable参数 reserveSelection: { type: Boolean, default: true }, //
selection列同el-table的reserve-selection参数 // 权限 code authCodes: { type: String, default: '' }, showSelect: { type:
Boolean, default: true }, // fixed参数是否固定 },
```
