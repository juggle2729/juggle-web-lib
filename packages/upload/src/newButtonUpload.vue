<template>
  <div>
    <section :style="{ 'max-width': width }">
      <el-upload
        ref="upload"
        class="upload-demo"
        :style="{ width: width }"
        :action="action"
        :header="uploadHeader"
        :on-success="handleUploadFileSuccess"
        :before-upload="beforeUploadFile"
        :data="data"
        :accept="limitType"
        :name="name"
        :limit="limit"
        multiple
        :on-progress="handleUploadFileProgress"
        :show-file-list="false"
        :on-error="handleError"
        :on-exceed="overExceed"
        :disabled="Boolean(fileList.length == limit)"
      >
        <el-button size="small" type="primary" :disabled="Boolean(fileList.length == limit)" @click="uplodad">
          <i class="el-icon-folder-add" style="margin-right: 3px" />
          <span class="text">
            <slot />
          </span>
        </el-button>
        <template #tip>
          <slot name="tips">
            <div class="upload-tips">
              {{ tips }}
            </div>
          </slot>
        </template>
      </el-upload>

      <div v-for="(item, index) in fileObjectList" :key="item.uuid" class="uploadBoxList">
        <div
          class="uploadBox"
          :class="[
            { upSuccess: item.percentage >= 100 || (item.percentage && item.percentage < 100) },
            { upError: item.error },
            { upFirst: index === 0 },
            { limitOne: limit === 1 },
          ]"
        >
          <i class="el-icon-tickets" />
          <div class="uloadContent">
            <div class="filename" :class="{ errorName: item.error }">
              {{ item.name }}
            </div>
            <div class="success_box commonBox">
              <i class="el-icon-delete" @click="handleRemove(index)" />
            </div>
            <div class="error_box commonBox">
              <i class="el-icon-delete" @click="handleRemove(index)" />
            </div>
            <div v-if="item.error" class="error_status commonBox">
              <i class="el-icon-error" style="color: #f56c6c" />
            </div>
            <div v-if="item.percentage && item.percentage < 100" class="uploadPengding commonBox">
              {{ item.percentage }}%
            </div>
            <div v-if="item.percentage && item.percentage < 100" class="processBox">
              <el-progress :percentage="item.percentage" :show-text="false" width="4" stroke-linecap="square" />
            </div>
          </div>
        </div>
      </div>
      <el-image-viewer
        v-if="isPrewView"
        class="preView"
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
      <juggle-pdf :url="preViewUrl" />
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import { h } from 'vue';
import { download } from 'juggle-web-lib/utils/file.js';
export default {
  name: 'juggle-newButtonUpload',
  props: {
    action: {
      type: String,
      default: '/web/file/upload',
    },
    data: {
      type: Object,
      default: () => ({ bizType: 'CMS' }),
    },
    name: {
      type: String,
      default: 'files',
    },
    validFileName: {
      type: Function,
      default: void 0,
    },
    // 支持拓展名文案
    tips: {
      type: String,
      default: '',
    },
    // 限制的文件大小
    maxSize: {
      type: Number,
      default: 50,
    },
    // 限制的文件个数
    limit: {
      type: Number,
      default: 1,
    },
    // 限制的文件类型
    limitType: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '300px',
    },
    // 是否开启预览
    onPreview: {
      type: Boolean,
      default: false,
    },
    // 预览是否下载
    preViewDownload: {
      type: Boolean,
      default: false,
    },
    downLoadUrl: {
      type: String,
      default: '',
    },
    noInitFileList: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['getUploadList', 'ifError', 'upload-success', 'remove', 'getAllInfoList'],
  data() {
    return {
      isPrewView: false,
      isPdfPrewView: false,
      preViewUrl: '',
      uploadHeader: {
        'content-type': 'multipart/form-data',
      },
      percentage: 0,
      fileList: [],
      fileObjectList: [],
      snList: [],
      allInfoList: [],
      beforeUploadPass: true,
    };
  },
  methods: {
    init(array) {
      this.fileList = [];
      this.fileObjectList = [];
      this.snList = [];
      this.allInfoList = array;
      array.forEach(element => {
        element.percentage = 100;
        element.uuid = this.guid();
        this.fileList.push({ externalUrl: element.externalUrl, sn: element.sn });
        this.fileObjectList.push(element);
        this.snList.push(element.sn);
      });
      this.$emit('getUploadList', this.snList);
      this.$emit('getAllInfoList', this.fileObjectList);
    },
    // 上传前钩子 入口
    beforeUploadFile(file) {
      this.beforeUploadPass = this.handleBeforeUpload(file);
      return this.beforeUploadPass;
    },
    handleBeforeUpload(file) {
      if (!this.beforeUploadPass) return false;
      let result = true;
      let obj = {};
      obj.name = file.name;
      obj.error = false;
      obj.url = URL.createObjectURL(file);
      obj.uuid = this.guid();
      obj.percentage = 1;
      if (this.limitType) {
        if (this.validFileName) {
          result = this.validFileName(file);
        } else {
          const limitList = this.limitType.split(',');
          const fileType = `.${file.type.split('/')[1]}`;
          result = limitList.includes(fileType);
        }
        if (!result) {
          this.showFailMessage(obj.name, '文件格式错误，上传失败');
          obj.error = true;
          obj.url = null;
          return result;
        }
      }
      const size = file.size / 1024 / 1024;
      if (size > this.maxSize) {
        this.showFailMessage(obj.name, '文件大于规定大小，上传失败。');
        obj.error = false;
        obj.url = null;
        result = false;
        return result;
      }
      if (result) {
        this.fileList.push(file);
        this.fileObjectList.push(obj);
      }
      return result;
    },
    // 校验未通过时弹窗
    showFailMessage(name, content, operation) {
      ElMessage.error({
        customClass: 'el-message--error',
        iconClass: 'el-icon-warning',
        showClose: true,
        duration: 5000,
        message: h(
          'p',
          {
            class: 'textBox',
          },
          [
            h(
              'span',
              {
                class: 'largeTitle',
              },
              `${name}`
            ),
            h(
              'span',
              {
                class: 'smallText',
              },
              `${content}`
            ),
            h(
              'span',
              {
                class: 'btnText',
                onClick: () => {
                  this.resetUpload();
                },
              },
              `${operation || operation === '' ? operation : '重新上传'}`
            ),
          ]
        ),
      });
    },
    // 上传中钩子
    handleUploadFileProgress(e, file) {
      const currentIndex = this.fileList.findIndex(item => {
        return item.uid === file.uid;
      });
      if (e.percent < 100) {
        this.fileObjectList[currentIndex].percentage = Math.floor(e.percent);
      } else {
        this.fileObjectList[currentIndex].percentage = 99;
      }
    },
    // 上传成功钩子
    handleUploadFileSuccess(e, file) {
      const currentIndex = this.fileList.findIndex(item => {
        return item.uid === file.uid;
      });
      const { data = [] } = e || {};
      this.$emit('upload-success', data);
      this.fileObjectList[currentIndex].percentage = 99;
      if (data && data[0] && data[0].sn) {
        this.snList[currentIndex] = data[0].sn;
        this.allInfoList[currentIndex] = data[0];
        this.$emit('getAllInfoList', this.allInfoList);
        this.$emit('getUploadList', this.snList);
        this.ifError();
      }
      setTimeout(() => {
        this.fileObjectList[currentIndex].percentage = 100;
      });
    },
    // 超过文件个数时的钩子
    overExceed() {
      this.showFailMessage('', '文件个数超过限制，上传失败。', '');
    },
    // 删除
    handleRemove(index) {
      this.$emit('remove', this.fileList[index]);
      this.fileList.splice(index, 1);
      this.allInfoList.splice(index, 1);
      this.snList.splice(index, 1);
      this.$emit('getAllInfoList', this.allInfoList);
      this.$emit('getUploadList', this.snList);
      this.fileObjectList.splice(index, 1);
      this.ifError();
      this.$refs.upload.abort();
    },
    // 重传
    resetUpload() {
      this.beforeUploadPass = true;
      setTimeout(() => {
        this.$refs.upload.uploadRef.handleClick();
      });
    },
    uplodad() {
      this.beforeUploadPass = true;
    },
    // 上传失败
    handleError(err, file) {
      if (err) {
        const currentIndex = this.fileList.findIndex(item => {
          return item.uid === file.uid;
        });
        this.fileObjectList[currentIndex].error = true;
        this.fileObjectList[currentIndex].percentage = 0;
        ElMessage.error({
          customClass: 'el-message--error',
          iconClass: 'el-icon-warning',
          message: '当前网络异常，请稍后再试。',
        });
      }
      this.ifError();
    },
    // 待上传文件上是否有错误文件,错误时不能上传
    ifError() {
      const errorFalg = this.fileObjectList.some(item => {
        return item.error === true;
      });
      this.$emit('ifError', errorFalg);
    },
    preView(file) {
      if (this.onPreview) {
        if (this.preViewDownload) {
          if (!this.downLoadUrl) {
            ElMessage.error({
              message: '获取下载链接失败！',
            });
            return false;
          }
          download(this.downLoadUrl);
          return true;
        }
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
    // 生成uuid
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    // 获取当前媒体源时长 预留
    getTime(file) {
      let playTime = 0;
      const content = file;
      const url = URL.createObjectURL(content);
      const audioElement = new Audio(url);
      audioElement.addEventListener('loadedmetadata', () => {
        playTime = audioElement.duration;
        if (playTime) {
          this.$emit('getAudioTime', playTime);
        }
      });
    },
    // 清空
    clearFileList() {
      this.fileList = [];
      this.fileObjectList = [];
      this.snList = [];
      this.allInfoList = [];
    },
  },
};
</script>

<style lang="less" scoped>
@primary-color: #128a78;
@danger-color: #d40000;
.upload-demo {
  width: 300px;

  /deep/.el-button--primary {
    background-color: @primary-color;
    border-color: @primary-color;
  }

  /deep/.el-button--small {
    font-size: 14px;
    padding: 5px 12px;
  }
  .upload-tips {
    margin-top: 0;
    line-height: 20px;
    font-size: 12px;
    margin-top: 5px;
    color: #909399;
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
        .el-progress-bar__inner {
          background-color: #18b8a0;
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
  color: #128a78;
  margin-right: 8px;
  cursor: pointer;
}
.btnText::after {
  content: ' ';
  position: absolute;
  width: 100%;
  height: 1px;
  background: #128a78;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
}
.textBox {
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
