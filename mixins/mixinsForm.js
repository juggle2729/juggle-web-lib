import { convertTime2Stamp } from '../utils/base';
import { validateFields, clearValidateField } from '../utils/forms';
export default {
  props: {
    loadingQuery: { type: Boolean, default: false },
  },
  data() {
    return {
      form: {},
      rules: {},
      // 需要进行表单验证的字段列表
      validateKeys: null,
      // 表单默认属性
      formDefProps: {
        ref: 'formRef',
        size: 'mini',
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
    },

    getDefaultValidateKeys() {
      return Object.keys(this.rules);
    },
    /**
     * 取得需要验证的字段列表
     */
    getValidteKeys() {
      if (!this.validateKeys) {
        this.validateKeys = this.getDefaultValidateKeys();
      }
      return this.validateKeys;
    },
    /**
     * 触发表单验证
     */
    validate() {
      return validateFields(this.$refs.formRef, this.getValidteKeys());
    },
    validateFileds(keys) {
      if (!keys) {
        keys = this.getDefaultValidateKeys();
      } else if (typeof keys == 'string') {
        keys = [keys];
      }
      return validateFields(this.$refs.formRef, keys);
    },
    // 清空表单对应字段的验证
    clearValidate(keys) {
      if (!keys) {
        // 若传入的字段列表为空,则取得getValidateKeys返回值
        keys = this.getValidteKeys();
      } else if (typeof keys === 'string') {
        // 若传入的参数为字符串,则将其组装为数组
        keys = [keys];
      }
      clearValidateField(this.$refs.formRef, keys);
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
