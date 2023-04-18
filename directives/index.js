const context = require.context('./', false, /\.js$/);
const ignoreFiles = { './index.js': true };
const keys = context.keys().filter(item => !ignoreFiles[item]);
const moduleDefs = keys.map(key => context(key).default);
export default {
  install: app => {
    moduleDefs.forEach(module => {
      app.directive(module.name, module);
    });
  },
};
