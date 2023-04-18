export default {
  name: 'resize',
  mounted(el, binding) {
    let width = '';
    let height = '';
    function isReize() {
      const style = document.defaultView.getComputedStyle(el);
      if (width !== style.width || height !== style.height) {
        binding.value(style.width, style.height); // 关键
      }
      width = style.width;
      height = style.height;
    }
    el.__vueSetInterval__ = setInterval(isReize, 300);
  },
  unmounted(el) {
    clearInterval(el.__vueSetInterval__);
  },
};
