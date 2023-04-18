<!--新UI规范综合文件upload组件，支持多选 -->
<template>
  <div>
    <section style="min-width:350px;">
      <el-upload
        ref="upload"
        class="upload-demo"
        :file-list="fileList"
        :on-success="handleUploadFileSuccess"
        :before-upload="beforeAvatarUpload"
        :on-exceed="overExceed"
        drag
        multiple
        :accept="limitType"
        :limit="limit"
        :data="{ bizType: 'CMS' }"
        action="/web/file/upload"
        :header="uploadHeader"
        :show-file-list="false"
        :on-error="handleError"
        :on-progress="handleUploadFileProgress"
        :disabled="fileList.length === limit"
        @click="upload"
        name="files">
        <div class="icon-area">
          <el-image :src="require('../assets/Order.png')" class="icon-s-order"></el-image>
        </div>
        <div class="el-upload__text">
          <p class="title">{{ title }}</p>
          <p class="subtitle">{{ subTitle }}</p>
          <p class="subtitle">{{ tips }}</p>
        </div>
      </el-upload>
      <div v-for="(item,index) in fileObjectList" :key="item.uuid" class="uploadBoxList">
        <div
          class="uploadBox"
          :class="[{ upSuccess: item.percentage == 100 || (item.percentage && item.percentage != 100) },{ upError: item.error },{upFirst: index === 0 }, {limitOne: limit === 1}]"
        >
          <i class="el-icon-tickets"></i>
          <div class="uloadContent">
            <div class="filename"  :class="{ errorName: item.error }" @click="preView(fileList[index])">
              {{ item.name }}
            </div>
            <div class="success_box commonBox">
              <i class="el-icon-delete" @click="handleRemove(index)"></i>
            </div>
            <div class="error_box commonBox">
              <i class="el-icon-refresh-right" @click="resetSubmit(index)" style="margin-right:8px"></i>
              <i class="el-icon-delete" @click="handleRemove(index)"></i>
            </div>
            <div class="error_status commonBox" v-if="item.error">
              <i class="el-icon-error" style="color:#f56c6c"></i>
            </div>
            <div class="uploadPengding commonBox" v-if="item.percentage && item.percentage != 100">{{ item.percentage }}%</div>
            <div class="processBox" v-if="item.percentage && item.percentage != 100">
              <el-progress :percentage="item.percentage" :show-text="false" width="4" stroke-linecap="square"></el-progress>
            </div>
          </div>
        </div>
      </div>
      <el-image-viewer
        class="preView"
        v-if="isPrewView"
        :url-list="[preViewUrl]"
        :hide-on-click-modal="true"
        @close="closePreview"
      />
    </section>
    <el-dialog
        v-model="isPdfPrewView"
        title="PDF预览"
        width="600px"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
      >
        <juggle-pdf :url="preViewUrl"></juggle-pdf>
      </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import {h} from 'vue';
export default {
  name: 'juggle-fileUpload',
  emits: ['getUploadList', 'ifError'],
  props: {
    title: {
      type: String,
      default: '点击或将文件拖拽到这里上传'
    },
    subTitle: {
      type: String,
      default: ''
    },
    tips: {
      type: String,
      default: ''
    },
    maxSize: {
      type: Number,
      default: 50,
    },
    // 限制的文件个数
    limit: {
      type: Number,
      default: 1
    },
    limitType: {
      type: String,
      default: ''
    },
    // 是否开启预览
    onPreview: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      percentage: 0,
      isPrewView: false,
      isPdfPrewView: false,
      preViewUrl: '',
      uploadHeader: {
        'content-type': 'multipart/form-data'
      },
      fileList: [],
      fileObjectList: [],
      snList: [],
      beforeUploadPass: true,
      processIndex: 0,
      successOrEoorIndex: 0,
      resetIndex: -1
    }
  },
  mounted() {
    let audioShow = document.getElementsByClassName("upload-demo");
    audioShow[0].ondrop = (() => {
      this.upload();
    });
  },
  methods: {
    // 上传前钩子 入口
    beforeAvatarUpload(file) {
      this.beforeUploadPass = this.handleBeforeUpload(file);
      return this.beforeUploadPass;
    },
    // 处理上传前的钩子 多文件有一个错误，中断执行
    handleBeforeUpload(file) {
      if (!this.beforeUploadPass)
        return false;
      let result = true;
      let obj = {};
      obj.name = file.name;
      obj.error = false;
      obj.url = URL.createObjectURL(file);
      obj.uuid = this.guid();
      if (this.limitType) {
        const limitList = this.limitType.split(',');
        const fileType = `.${file.type.split('/')[1]}`;
        if (!limitList.includes(fileType)) {
          this.showFailMessage(obj.name, '文件格式错误，上传失败');
          obj.error = true;
          obj.url = null;
          result = false;
          return result;
        }
      }
      const size = file.size / 1024 / 1024;
      if (size > this.maxSize) {
        this.showFailMessage(obj.name, '文件大于规定大小，上传失败。');
        obj.error = false;
        obj.url = null;
        result =  false;
        return result;
      }
      if (result) {
        if (this.resetIndex === -1) {
          this.fileList.push(file);
          this.fileObjectList.push(obj);
        } else {
          this.fileList.splice(this.resetIndex, 0, file);
          this.fileObjectList.splice(this.resetIndex, 0, file);
        }
      }
      return result;
    },
    // 上传中钩子
    handleUploadFileProgress(e) {
      if (this.processIndex <= this.fileList.length - 1) {
        const index = this.resetIndex === -1 ? this.processIndex : this.resetIndex;
        if (Math.floor(e.percent) == 100) {
          this.fileObjectList[index].percentage = 99;
        } else {
          this.fileObjectList[index].percentage = Math.floor(e.percent);
        }
        this.processIndex ++;
      }
    },
    // 上传成功钩子
    handleUploadFileSuccess(e) {
      const index = this.resetIndex === -1 ? this.successOrEoorIndex : this.resetIndex;
      const { data = [] } = e || {};
      if (data[0].sn) {
        this.snList[index] = data[0].sn;
        this.$emit('getUploadList', this.snList);
        this.ifError();
      }
      this.fileObjectList[index].percentage = 100;
      this.successOrEoorIndex ++;
      this.resetIndex = -1;
    },
    // 超过文件个数时的钩子
    overExceed() {
      this.showFailMessage('', '文件个数超过限制，上传失败。', '');
    },
    // 删除
    handleRemove(index) {
      this.fileList.splice(index, 1);
      this.snList.splice(index, 1);
      this.$emit('getUploadList', this.snList);
      this.fileObjectList.splice(index, 1);
      this.ifError();
      this.$refs.upload.abort();
      this.processIndex --;
      this.successOrEoorIndex --;
    },
    upload() {
      this.beforeUploadPass = true;
    },
    // 重传
    resetUpload() {
      this.beforeUploadPass = true;
      setTimeout(() => {
        this.$refs.upload.uploadRef.handleClick();
      });
    },
    // 断点重传
    resetSubmit(index) {
      const tempFile = this.fileList[index];
      this.resetIndex = index;
      this.fileList.splice(index, 1);
      this.fileObjectList.splice(index, 1);
      this.processIndex --;
      this.successOrEoorIndex --;
      this.$refs.upload.uploadRef.upload(tempFile);
    },
    // 上传失败
    handleError(err) {
      if (err) {
        const index = this.successOrEoorIndex;
        this.fileObjectList[index].error = true;
        this.fileObjectList[index].percentage = 0;
        ElMessage.error({
          customClass: 'el-message--error',
          iconClass: 'el-icon-warning',
          message: '当前网络异常，请稍后再试。'
        });
      }
      this.ifError();
      this.processIndex ++;
      this.successOrEoorIndex ++;
      this.resetIndex = -1;
    },
    // 待上传文件上是否有错误文件,错误时不能上传
    ifError() {
      const errorFalg = this.fileObjectList.some(item => {
        return item.error === true;
      });
      this.$emit('ifError', errorFalg);
    },
    // 校验未通过时弹窗 重新上传
    showFailMessage(name, content, operation) {
      ElMessage.error({
        customClass: 'el-message--error',
        iconClass: 'el-icon-warning',
        showClose: true,
        duration: 5000,
        message: h(
          'p',
          {
            class: 'textBox'
          },
          [
            h(
              'span',
              {
                class: 'largeTitle'
              },
              `${name}`
            ),
            h(
              'span',
              {
                class: 'smallText'
              },
              `${content}`
            ),
            h(
              'span',
              {
                class: 'btnText',
                onClick: () => {
                  this.resetUpload();
                }
              },
              `${(operation || operation === '') ? operation : '重新上传'}`
            )
          ]
        )
      });
    },
    // 生成uuid
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      })
    },
    // 获取当前媒体源时长 预留
    getTime(file) {
      let  playTime = 0;
      const content = file;
      const url = URL.createObjectURL(content);
      const audioElement = new Audio(url);
      audioElement.addEventListener('loadedmetadata', () => {
        playTime = audioElement.duration;
        if (playTime) {
          this.$emit('getAudioTime', playTime);
        }
      })
    },
    // 预览
    preView(file) {
      if (this.onPreview) {
        const url = file.size ? URL.createObjectURL(file) : file;
        this.preViewUrl = url;
        if (file.type === 'application/pdf') {
          // pdf预览
          this.isPdfPrewView = true;
        } else {
        // 图片预览
          this.isPrewView = true;
        }
      }
    },
    closePreview() {
      this.isPrewView = false;
    },
    // 清空
    clearFileList() {
      this.fileList = [];
      this.fileObjectList = [];
      this.snList = [];
      this.processIndex = 0;
      this.successOrEoorIndex = 0;
      this.resetIndex = -1;
    }
  }
}
</script>

<style lang="less" scoped>
  @primary-color: #128A78;
  @danger-color: #D40000;
  /deep/.el-upload {
    width: 100%;
  }
  /deep/.el-upload-dragger {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    min-width: 300px;
    min-height: 192px;
    width: 100%;

    &:hover {
      border: 1px dashed @primary-color;
    }

    .icon-area {
      width: 100%;
      flex-direction: column;
      margin-bottom: 20px;
    }
    .icon-s-order {
      width: 40px;
      height: 42px;
      margin-bottom: -50px;
    }

    .el-upload__text {
      .title {
        margin: 0;
        font-size: 16px;
        line-height: 24px;
      }
      .subtitle {
        margin: 5px 0 0 0;
        font-size: 14px;
        line-height: 22px;
        color: #919398;
      }
    }
  }
  .uploadBoxList {
  .uploadBox {
    width: 100%;
    height: 34px;
    display: flex;
    justify-self: flex-start;
    align-items: center;
    .filename {
      color: #606266;
      font-size: 14px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 2px;
      line-height: 32px;
      cursor: pointer;
      &.errorName {
        color: #f56c6c;
      }
    }
    &.upSuccess {
      &:hover {
        background: rgba(@primary-color, 0.16);
        .filename {
          color: @primary-color;
        }
        .success_box {
          display: block !important;
        }
        .uploadPengding {
          display: none;
        }
      }
    }
    &.upError {
      &:hover {
        background: rgba(@primary-color, 0.16);
        .filename {
          color: @danger-color;
        }
        .error_box {
          display: block !important;
        }
        .error_status {
          display: none;
        }
      }
    }
    &.upFirst {
      margin-top: 14px;
    }
    &.limitOne {
      margin-bottom: 10px;
    }
    .uloadContent {
      position: relative;
      flex: 1;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      line-height: 1;

      .processBox {
        position: absolute;
        width: 100%;
        left: 0;
        bottom: -2px;
      }
      .commonBox {
        cursor: pointer;
        position: absolute;
        right: 3px;
        top: 50%;
        transform: translateY(-50%);
        &.uploadPengding {
          color: #606266;
        }
        &.success_box {
          display: none;
        }
        &.error_box {
          display: none;
        }
      }
    }
    /deep/.el-progress-bar {
      .el-progress-bar__outer {
        .el-progress-bar__inner  {
          background-color: #18B8A0;
        }
      }
    }
  }
  }
</style>
<style lang="less">
.zTopIndex {
  z-index: 2300 !important;
}
.upload-demo .el-upload__tip {
  margin-top: 0;
  line-height: 20px;
}
.el-message {
  z-index: 3000 !important;
}
.el-message .el-icon-error {
  color: #f56c6c !important;
}
.largeTitle {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  max-width: 100px;
  margin-right: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.smallText {
  color: #303133;
  font-size: 14px;
}
.btnText {
  position: relative;
  font-size: 14px;
  margin-left: 4px;
  color: #128A78;
  margin-right: 8px;
  cursor: pointer;
}
.btnText::after {
  content: ' ';
  position: absolute;
  width: 100%;
  height: 1px;
  background: #128A78;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
}
.textBox {
  // min-width: 380px;
  padding-right: 20px;
}
.preView {
  .el-image-viewer__canvas {
    img {
      max-height: 90% !important;
      max-width: 90% !important;
    }
  }
}
</style>
