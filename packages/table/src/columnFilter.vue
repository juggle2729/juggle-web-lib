<template>
  <span>{{ context }}</span>
</template>

<script>
export default {
  props: {
    val: '',
    filter: null,
    scope: {},
    sep: { type: String, default: '-' },
  },
  computed: {
    context() {
      let result = this.val;
      if (result) {
        result = result.split(',');
        result = result.map(val => this.scope.row[val]);
      }
      if (this.filter) {
        result = result.map(val => this.filter(val, this.scope.row, this.scope));
      }
      result = result.join(this.sep || '-');
      return result;
    },
  },
};
</script>

<style></style>
