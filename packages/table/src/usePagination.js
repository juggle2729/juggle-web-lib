import { h, resolveComponent } from 'vue';

const pageDefaultProps = {
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  pageSizes: [20, 30, 40, 50],
};
export default function usePagination(options, pageable, pagiDefListener) {
  const { pageProps } = options;
  const { pageNum: currentPage, pageSize, total } = pageable;

  const paginationProps = { ...pageDefaultProps, ...pagiDefListener, ...pageProps, currentPage, pageSize, total };
  return h('div', { class: 'simple-table_page-wrapper' }, h(resolveComponent('el-pagination'), paginationProps));
}
