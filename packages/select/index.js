import selectFlat from './src/selectFlat.vue';
import selectCascader from './src/selectCascader.vue';
import selectMul from './src/selectMul.vue';

const install = function (vue) {
  vue.component(selectFlat.name, selectFlat);
  vue.component(selectCascader.name, selectCascader);
  vue.component(selectMul.name, selectMul)
};

export default { install };
