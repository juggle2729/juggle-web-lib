<template>
  <el-popconfirm
    v-if="hasAuth || showAll"
    v-bind="popconfirmProps"
    trigger="manual"
    popper-class="juggle-popconfirm"
    :visible="visible"
    @cancel="handlerVisible(false)"
    @confirm="$emit('click', handlerVisible)"
  >
    <template #reference>
      <el-button v-bind="props" :data-id="popconfirmProps.id" @click="handlerVisible(true)" :disabled="!hasAuth">{{
        title
      }}</el-button>
    </template>
  </el-popconfirm>
</template>
<script>
import { ref } from 'vue';

export default {
  name: 'juggle-popconfirm',
  emits: ['click', 'check'],
  props: {
    // 权限码
    authCode: { type: String, default: '' },
    title: { type: String, default: '' },
    // 按钮的相关属性
    props: {
      type: Object,
      default: () => ({}),
    },
    // 气泡确认框相关属性
    popconfirmProps: {
      type: Object,
      default: () => ({}),
    },
    showAll: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    let visible = ref(false);
    const handlerVisible = value => {
      visible.value = value;
    };
    return { visible, handlerVisible };
  },
  mounted() {
    if (this.popconfirmProps.className) {
      const tableNodesWarp = document.getElementsByClassName(`${this.popconfirmProps.className}`);
      tableNodesWarp[0].addEventListener('click', this.handlerClick);
      document.getElementById('app').addEventListener('click', this.handlerClick);
      const tableNodes = tableNodesWarp[0].getElementsByClassName('el-table__body-wrapper');
      !!tableNodes.length &&
        tableNodes[0].addEventListener('scroll', () => {
          this.handlerVisible(false);
        });
    } else {
      document.getElementById('app').addEventListener('click', this.handlerClick);
      const tableNodes = document.getElementsByClassName('el-table__body-wrapper');
      !!tableNodes.length &&
        tableNodes[0].addEventListener('scroll', () => {
          this.handlerVisible(false);
        });
    }
  },
  beforeUnmount() {
    if (this.popconfirmProps.className) {
      document.getElementsByClassName('el-overlay')[1].removeEventListener('click', this.handlerClick);
      const tableNodesWarp = document.getElementsByClassName(`${this.popconfirmProps.className}`);
      const tableNodes = tableNodesWarp[0].getElementsByClassName('el-table__body-wrapper');
      !!tableNodes.length &&
        tableNodes[0].addEventListener('scroll', () => {
          this.handlerVisible(false);
        });
    } else {
      document.getElementById('app').removeEventListener('click', this.handlerClick);
      const tableNodes = document.getElementsByClassName('el-table__body-wrapper');
      !!tableNodes.length &&
        tableNodes[0].addEventListener('scroll', () => {
          this.handlerVisible(false);
        });
    }
  },
  methods: {
    handlerClick(event) {
      this.handlerVisible(false);
      const e = event || window.event;
      const targetId = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id');
      if (targetId && targetId === this.popconfirmProps.id) {
        this.$emit('check', this.handlerVisible);
      }
    },
  },
  computed: {
    hasAuth() {
      if (!this.authCode) return true;
      if (!this.$sysConf.authCodes) return false;
      return this.$sysConf.authCodes[this.authCode];
    },
  },
};
</script>

<style lang="less">
.juggle-popconfirm {
  padding: 24px !important;
  .el-popconfirm {
    min-width: 258px;
    &__main {
      margin-top: 0;
      margin-bottom: 24px;
      .el-popconfirm__icon {
        margin-right: 8px;
      }
    }
  }
}
</style>
