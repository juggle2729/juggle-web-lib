<template>
<div class="dropdown">
  <el-dropdown trigger="click">
    <span class="el-dropdown-link" >
      {{$t('sale.index.A07_01_0017')}}<i class="el-icon-arrow-down el-icon--right"></i>
    </span>
    <template #dropdown>
      <el-dropdown-menu class="menu-new-drop">
        <span v-for="(item,index) in tempOps" :key="index">
          <el-dropdown-item v-if="hasAuth(item.authCode) || item.showAll" v-bind="item" :disabled="!hasAuth(item.authCode)">
            {{item.title}}
          </el-dropdown-item>
        </span>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</div>
</template>
<script>
export default {
  name: 'juggleDropdown',
  props: {
    tempOps: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    /* eslint-disable */
    hasAuth(authCode) {
      if (process.env.VUE_APP_MENU == 'self') return true;
      if (!authCode) return true;
      if (!this.$sysConf.authCodes) return false;
      return this.$sysConf.authCodes[authCode];
    }
  }
};
</script>

<style lang="less">
  .dropdown {
    .el-dropdown {
      color: #128A78;
      line-height: inherit;
      margin-left: 12px;
      &:after{
        content: "";
        display: block;
        width: 1px;
        height: 12px;
        background-color: #D9D9D9;
        position: absolute;
        top: 4px;
        left: -6px;
      }
    }
    .el-dropdown-link {
      cursor: pointer;
    }
  }
  .menu-new-drop li{
    color: #128A78;
    min-width: 110px;
    display: inline-block;
    display: -webkit-box;
    -webkit-line-clamp: 1; 
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    &:hover {
      background-color: #F5F7FA !important;
    }
  }
</style>