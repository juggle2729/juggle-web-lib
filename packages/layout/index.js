import main from './src/main.vue';

export default {
  main,
  install(vue) {
    vue.component(main.name, main);
  },
};
