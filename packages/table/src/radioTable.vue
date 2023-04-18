<script>
// import { h, toRefs, ref } from 'vue';
import { h, ref, unref, toRefs, resolveComponent } from 'vue';
import table from './table.vue';

export default {
  name: 'juggle-radio-table',
  props: {
    // 表格头配置数据
    columns: { type: Array, default: () => [] },
    selectable: { type: Function, default: null },
    currentId: { type: [Number, String] }, // 当前选中的id
    cancelSelet: {type: Boolean, default: false}, // 取消选中状态
  },
  emits: ['selectionChange'],
  setup(props, { emit }) {
    let { columns } = toRefs(props);
    const selectId = props.currentId ? ref(props.currentId) : ref(-1);
    columns = unref(columns);
    let columnsArr = ref([]);
    columnsArr.value.push(...columns);
    columnsArr.value.push({
      label: '操作',
      render: scope => {
        const { row } = scope;
        return h(
          resolveComponent('el-radio'),
          {
            modelValue: selectId.value,
            label: row.id,
            onBlur: () => {
              if (props.cancelSelet) {
                selectId.value = selectId.value === row.id ? -1 : row.id;
                emit('getSelectId', selectId.value, row);
              }
            },
            onChange: () => {
              if (!props.cancelSelet) {
                selectId.value = row.id;
                emit('getSelectId', row.id, row);
              }
            },
          },
          { default: () => '' }
        );
      },
    });

    return () => h(table, { ref: 'tableRef', ...props, columns: columnsArr.value });
  },
  methods: {
    toQuery() {
      this.$refs.tableRef.toQuery();
    },
  },
};
</script>
