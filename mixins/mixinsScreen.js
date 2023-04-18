import { convertTime2Stamp } from '../utils/base';
export default {
  emits: ['query', 'add'],
  props: {
    loadingQuery: { type: Boolean, default: false },
  },
  data() {
    return {
      form: {},
      formDefProps: {
        ref: 'formRef',
        size: 'mini',
        'hide-required-asterisk': true,
        inline: true,
      },
    };
  },
  methods: {
    /**
     * 取得表单数据
     * @returns
     */
    getFormData() {
      return { ...this.form };
    },
    /**
     * 清空表单
     */
    clearForm() {
      this.form = {};
      this.$emit('query');
    },

    convertTimeRangeToTarget(target, timeRange, names = ['createTimeStart', 'createTimeEnd']) {
      if (timeRange) {
        const [a0, a1] = this.convertTime2Stamp(timeRange);
        target[names[0]] = a0;
        target[names[1]] = a1;
      }
    },

    convertTime2Stamp(times) {
      return convertTime2Stamp(times);
    },
  },
};
