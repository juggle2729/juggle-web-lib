<template>
  <van-popup
    v-model:show="show"
    position="top"
    :style="{ background: 'none' }"
    :overlay-class="{ background: 'rgba(0, 0, 0, 0.5);' }"
    :close-on-click-overlay="false"
  >
    <div class="downLoadPop-content">
      <div class="downLoadPop-img">
        <van-image :src="require('@/assets/image/sharePop.jpg')" class="img" fit="contain" />
      </div>
      <div class="downLoadPop-text">
        <div>
          <p>1.点击右上角</p>
          <p>2.用浏览器打开</p>
          <p>3.进入APP</p>
        </div>
      </div>
    </div>
  </van-popup>
</template>
<script>
import { Popup, Image } from 'vant';
export default {
  components: {
    vanPopup: Popup,
    vanImage: Image,
  },
  name: 'juggle-popBrowser',
  computed: {},
  data() {
    return {
      show: true,
    };
  },
  created() {
  },
  methods: {
  },
};
</script>

<style lang="less" scoped>
.downLoadPop-content {
  width: 100%;
  height: auto;

  .downLoadPop-img {
    width: 100%;
    text-align: right;
    .img {
      width: 88px;
      height: 86px;
      margin: 10px 33px 0 0;
    }
  }
  .downLoadPop-text {
    width: 100%;
    display: flex;
    justify-content: center;
    div {
      width: 120px;
      font-family: PingFang SC;
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 16px;
      color: #ffffff;
    }
  }
}
</style>
