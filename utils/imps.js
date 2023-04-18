/**
 * @param {*} context
 * demo: require.context('./', false, /\.js$/)
 * 具体说明请查看webpack require.cotext相关文档
 * @param {*} options
 */
export function importAndCreatePlugin(context, options = {}) {
  const { ignoreFiles = { './index.js': true } } = options;
  const keys = context.keys().filter(item => !ignoreFiles[item]);
  const moduleDefs = keys.map(key => context(key).default);

  return {
    install: vue => {
      moduleDefs.forEach(moduleDef => vue.use(moduleDef));
    },
  };
}
