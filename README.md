<!--
 * @Descripttion: 
 * @Author: yang fu ren
 * @version: 
 * @Date: 2022-04-19 16:13:49
 * @LastEditors: yang fu ren
 * @LastEditTime: 2023-04-18 14:42:25
-->
# juggle-web 的常用方法库

## 开发之前

```shell
1. npm install
2. npm run prepare

```

## juggle-web-lib 开发流程

```shell
1. git checkout -b your_branch // 从master切出自己的分支
2. 开发功能
3. 修改package.json 的 version
4. 将开发分支合并到master分支
5. npm publish --tag tag_name
```

[使用 jekins 直接发布](http://47.97.230.127:38080/job/juggle-web-lib/build?delay=0sec)

## 文档库开发方式

```shell
1. npm i docsify-cli -g
2. docsify serve docs
3. 自动扫描docs文件下所有md文档, _sidebar.md 添加侧边栏链接
```

### 组件列表

[juggle-table](./docs/table.md)
