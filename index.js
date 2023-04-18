import directives from './directives';
import packages from './packages';
import plugins from './plugins';
import filters from './filters';
import mixinsCommon from './mixins/mixinsCommon';

import './styles/base.less';

function install (vue) {
  vue.use(directives);
  vue.use(packages);
  vue.use(plugins);
  vue.mixin(mixinsCommon);

  vue.config.globalProperties.$filters = filters;
}
export default { install };
