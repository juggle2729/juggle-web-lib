import selectionTable from './src/selectionTable.vue';
import radioTable from './src/radioTable.vue';
import table from './src/table.vue';

const install = function(vue) {
  vue.component(selectionTable.name, selectionTable);
  vue.component(table.name, table);
  vue.component(radioTable.name, radioTable);
};

export default { install };
