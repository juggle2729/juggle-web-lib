import headerQuery from './src/query.vue'

headerQuery.install = vue => {
  vue.component(headerQuery.name, headerQuery);
}

export default headerQuery;
