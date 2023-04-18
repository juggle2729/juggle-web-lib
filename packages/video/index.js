import Video from './src/video.vue';

const install = function(vue) {
  vue.component(Video.name, Video);
};

export default { install };
