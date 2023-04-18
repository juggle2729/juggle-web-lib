import main from './src/main.vue';
import layoutEmpty from './src/empty.vue';

import labelManager from './src/labelManager';
/**
 * router 监听处理
 * @param {*} router
 */
export function routerHandler(router, isMain) {
  labelManager.routerHandler(router, isMain);
}

export const empty = layoutEmpty;

export default {
  labelManager,
  main,
  install(vue) {
    vue.component(main.name, main);

    // label 管理
    vue.config.globalProperties.$labelManager = labelManager;
    if (!window.$labelManager) {
      window.$labelManager = labelManager;
    }
  },
};
