import { download } from '../utils/file';
export default {
  name: 'download',
  mounted: handle,
};

function handle(el, binding) {
  el.addEventListener(
    'click',
    () => {
      const { value } = binding;
      if (value) {
        download(value);
      } else {
        console.log('文件不存在，请传入文件');
      }
    },
    true
  );
}
