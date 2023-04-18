import fileUpload from './src/fileUpload';
import buttonUpload from './src/buttonUpload';
import newButtonUpload from './src/newButtonUpload';

const install = function(vue) {
  vue.component(fileUpload.name, fileUpload);
  vue.component(buttonUpload.name, buttonUpload);
  vue.component(newButtonUpload.name, newButtonUpload);
};

export default { install };
