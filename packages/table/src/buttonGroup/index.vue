<template>
<div class="juggle-table-btn-group" ref="container">
  <div class="juggle-table-btn-list" ref="btnList">
    <el-button size="mini" v-for="item in btnList" @click="item.onClick" :key="item.label">{{item.label}}</el-button>
    <el-dropdown v-if="moreBtnList.length">
      <el-button size="mini" class="more-btn">
        更多操作<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="item.onClick" v-for="(item,index) in moreBtnList" :key="item.label">{{item.label}}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</div>
</template>

<script>
export default {
  name: "juggleTableBtnGroup",
  data(){
    return {
      list: [
        {label: '按钮', onClick: () => console.log(444)},
        {label: '按钮', onClick: () => console.log(444)},
        {label: '按钮', onClick: () => console.log(444)},
        {label: '按钮', onClick: () => console.log(1)},
        {label: '按钮', onClick: () => console.log(2)},
        {label: '按钮', onClick: () => console.log(3)},
      ],
      moreBtnVisible: false,
      index: 0,
      btnListWith: [],
      btnListNodeWidth: 0,
    }
  },
  mounted(){
    this.initBtnWidth();
    this.initData();
    window.addEventListener('resize', this.initData);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.initData);
  },
  methods: {
    initBtnWidth() {
      const btnList = this.$refs.btnList;
      const btnListNodeWidth = btnList.offsetWidth;
      this.btnListNodeWidth = btnListNodeWidth;
      const getBtnWidth = (node) => {
        const nodeInfo = getComputedStyle(node);
        const marginLeft = nodeInfo.getPropertyValue('margin-left');
        const marginRight = nodeInfo.getPropertyValue('margin-right');
        return parseFloat(marginLeft) + parseFloat(marginRight) + node.offsetWidth;
      }
      const btnListWith = [];
      [...btnList.children].forEach(item => {
        btnListWith.push(getBtnWidth(item));
      });
      this.btnListWith = btnListWith;
    },
    initData() {
      const containerNode = this.$refs.container;
      const moreBtnWidth = 107;
      const containerNodeWidth = containerNode.offsetWidth;

      const btnListWith = this.btnListWith;
      // const getBtnWidth = (node) => {
      //   const nodeInfo = getComputedStyle(node);
      //   const marginLeft = nodeInfo.getPropertyValue('margin-left');
      //   const marginRight = nodeInfo.getPropertyValue('margin-right');
      //   return parseFloat(marginLeft) + parseFloat(marginRight) + node.offsetWidth;
      // }
      // const btnListWith = [];
      // [...btnList.children].forEach(item => {
      //   btnListWith.push(getBtnWidth(item));
      // });
      const btnListNodeWidth = this.btnListNodeWidth;
      if(btnListNodeWidth > containerNodeWidth){
        let totalWidth = moreBtnWidth;
        for (let i = 0;i < btnListWith.length;i++){
          if(totalWidth > containerNodeWidth){
            break;
          }
          this.index = i;
          totalWidth += btnListWith[i];
        }
      } else {
        this.index = 0;
      }
    }
  },
  computed: {
    btnList() {
      const list = this.list;
      const index = this.index;
      if(index < 1){
        return list;
      }
      return list.slice(0, index);
    },
    moreBtnList() {
      const list = this.list;
      const index = this.index;
      if(index < 1){
        return [];
      }
      return list.slice(index);
    }
  }
}
</script>

<style scoped lang="less">
.juggle-table-btn-group{
  overflow: hidden;
}
.juggle-table-btn-list{
  display: inline-block;
  white-space: nowrap;
}
.more-btn{
  margin-left: 10px;
}
</style>
