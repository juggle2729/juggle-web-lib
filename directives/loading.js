function initInDialog(vm) {
  // 判断是否在弹框中
  let parent = vm?.$parent;
  while (parent && parent.$options?.name !== 'ElOverlay'){
    parent = parent.$parent;
  }
  return parent?.$options?.name === 'ElOverlay';
}
function createLoadingIns(el, binding) {
  const vm = binding.instance;
  const bodyNode = document.body;
  const bodyScrollTop = document.documentElement.scrollTop;
  bodyNode.style.overflow = 'hidden';
  const textExr = el.getAttribute('element-loading-text')
  const spinnerExr = el.getAttribute('element-loading-spinner')
  const backgroundExr = el.getAttribute('element-loading-background')
  const customClassExr = el.getAttribute('element-loading-custom-class')
  el.loadingPlusIns = vm.$loading({
    target: el,
    text: vm && vm[textExr] || textExr,
    spinner: vm && vm[spinnerExr] || spinnerExr,
    background: vm && vm[backgroundExr] || backgroundExr,
    customClass: vm && vm[customClassExr] || customClassExr,
    ...(binding.modifiers || {})
  });
  if(initInDialog() || !binding.modifiers?.lockBody){
    return;
  }
  vm.$nextTick(() => {
    const spinner = el.loadingPlusIns.$el?.querySelector('.el-loading-spinner');
    const height = el.offsetHeight;
    const windowHeight = window.innerHeight;
    if(windowHeight < height){
      spinner.style.bottom = 'auto';
      spinner.style.top = (bodyScrollTop + (windowHeight - 100) / 2) + 'px';
    }
  });
}
function closeLoading(el) {
  const bodyNode = document.body;
  bodyNode.style.overflow = 'auto';
  el?.loadingPlusIns?.close();
}
function mounted(el, binding) {
  if (!!binding.value) {
    createLoadingIns(el, binding);
  }
}
function updated(el, binding) {
  if(binding.value === binding.oldValue){
    return;
  }
  if(binding.value) {
    createLoadingIns(el, binding);
  } else {
    closeLoading(el, binding);
  }
}
function beforeUnmount(el, binding) {
  closeLoading(el, binding);
}
function unmounted(el, binding) {
  closeLoading(el, binding);
}

export default {
  name: 'loadingPlus',
  mounted,
  beforeUnmount,
  updated,
  unmounted,
};