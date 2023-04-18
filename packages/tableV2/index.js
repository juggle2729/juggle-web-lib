import { ElTable } from '@juggle/juggle-LubanNo.7'
import '@juggle/juggle-LubanNo.7/theme-chalk/el-table.css';
import '../table/assets/less/table.less';


const install = function(vue) {
  vue.component('juggle-table-v2', ElTable);
};

export default { install };

