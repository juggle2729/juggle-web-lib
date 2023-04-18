export default {
  name: 'auth',
  mounted: handle,
  updated: handle,
};

function handle(el, binding) {
  if (process.env.VUE_APP_MENU == 'self') return;
  let { arg, value } = binding;
  if (!arg) return;
  if (!value || typeof value != 'object') value = {};
  const hasAuth = value[arg];
  el.style.display = hasAuth ? '' : 'none';
}
