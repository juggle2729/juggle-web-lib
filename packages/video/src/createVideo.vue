<template>
  <div class="video">
    <Video ref="videoPlayer" class="video-js vjs-big-play-centered">
    </Video>
  </div>
</template>

<script>
/* eslint-disable */
import Video from 'videoJs'
// import 'video.js/dist/video-js.css'
import videojs from 'videoJs';
import { download } from '../../../utils/file';
export default {
  emits: ['play', 'end', 'pause'],
  name: 'videoPlayer',
  compoents: {
    Video
  },
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    options: {
      handler(newVal) {
        const assiginOptions =  Object.assign(
          {
            language: 'zh-CN', // 语言
            autoplay: false, // 是否自动播放
            controls: true, // 是否现实控制台
            preload: 'auto', // 是否预加载
            aspectRatio: "16:9", // 横纵比
            dragFlag: true, // 是否可以拖动
            fileType: 'video', // audio 音频 video 视频
            loop: false, // 是否循环播放
            muted: false, // 是否静音
            notSupportedMessage: '此视频暂无法播放，请稍后再试', // 加载失败时显示
            controlBar: {
              children: [
                { name: 'playToggle' }, // 播放/暂停按钮
                { name: 'currentTimeDisplay' }, // 视频当前已播放时间
                { name: 'progressControl' }, // 播放进度条
                { name: 'durationDisplay' }, // 视频播放总时间
                { name: 'playbackRateMenuButton' }, // 倍数播放
                {
                  name: 'volumePanel', // 音量控制
                  inline: false // 不使用水平方式
                },
                { name: 'FullscreenToggle' } // 全屏
              ]
            }
          }, newVal
        )
        this.watchTimes ++;
        this.initPlay(assiginOptions);
        this.handleParams(assiginOptions);
      },
      deep: true
    }
  },
  data() {
    return {
      player: null,
      watchTimes: 0
    }
  },
  methods: {
    initPlay(assiginOptions) {
      this.player = videojs(this.$refs.videoPlayer, assiginOptions, function onPlayerReady() 
      {});
    },
    handleParams(assiginOptions) {
      // 是否有下载功能
      if (assiginOptions.downloadFlag && this.watchTimes === 1) {
        let processBar = document.getElementsByClassName("vjs-control-bar");
        let downLoadButton = document.createElement("div");
        downLoadButton.className = 'vjs-download';
        downLoadButton.innerHTML =
        `<svg width="1em" height="1em" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <title>xiazai</title>
            <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="xiazai" transform="translate(-0.000000, 0.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path d="M9.02683516,14.2964029 C9.29263098,14.2964029 9.54564816,14.1915643 9.73221639,14.0049005 L15.1248048,8.609549 L13.7625275,7.14820144 L10.0173397,10.9226565 L10.0173397,0 L8.00276184,0 L8.00276184,10.9226565 L4.32798195,7.14820144 L2.87519523,8.55585119 L8.32145393,14.0049005 C8.51057788,14.1941213 8.76103933,14.2964029 9.02683516,14.2964029 Z" id="路径"></path>
              <path d="M16.0128517,12.1126919 L16.0128517,16.0371017 L2.01856232,16.0371017 L2.01856232,12.1126919 L0,12.1126919 L0,17 C-4.33869274e-17,17.5522847 0.44771525,18 1,18 L17,18 C17.5522847,18 18,17.5522847 18,17 L18,12.1126919 L18,12.1126919 L16.0128517,12.1126919 Z" id="路径"></path>
            </g>
          </g>
        </svg>`;
        downLoadButton.addEventListener('click', () => {
          this.downLoad(assiginOptions.sources[0].src);
        });
        processBar[0].appendChild(downLoadButton);
      }
      // 上次视频播放点
      if (assiginOptions.lastPosition)
        this.player.currentTime(assiginOptions.lastPosition);
      // 不允许点击和滑动进度条
      if (!assiginOptions.dragFlag) {
        let processControl = document.getElementsByClassName("vjs-progress-control");
        processControl[0].style.pointerEvents = "none";
      }
      // 如果是音频使用默认占位符
      if (assiginOptions.fileType === 'audio') {
        let audioShow = document.getElementsByClassName("vjs-tech");
        audioShow[0].style.backgroundImage = "url(https://web-applet.oss-cn-hangzhou.aliyuncs.com/lcms/videojs/juggle_video_bg.png)";
      }
      // 播放点击
      const palyButton = document.getElementsByClassName("vjs-big-play-button");
      palyButton[0].onclick = (() => {
        this.play();
      })
      // 视频播放完毕
      const video = document.getElementsByClassName("vjs-tech");
      video[0].addEventListener('ended', () => { //结束
        this.end();
      }, false);
      // 视频暂停
      video[0].onpause= (() => {
        this.pause();
      });
      // 空格 切换播放/暂停
      video[0].onkeypress = ((e) => {
        if (e.keyCode === 32) {
          if (this.player.paused()) {
            this.player.play();
            this.play();
          } else {
            this.player.pause();
          }
        }
      });
    },
    // 获取当前播放进度
    getCurrentTimes() {
      if (this.player)
        return Math.ceil(this.player.currentTime());
    },
    // 获取总时间
    getTotalTimes() {
      if (this.player)
        return parseInt(this.player.duration()); 
    },
    // 下载
    downLoad(src) {
      download(src);
    },
    // 监听播放事件
    play() {
      const currentTimes = this.getCurrentTimes();
      const totalTimes = this.getTotalTimes();
      this.$emit('play', currentTimes, totalTimes );
    },
    // 视频播完了
    end() {
      this.$emit('end');
    },
    pause() {
      this.$emit('pause');
    }
  },
  beforeDestory() {
    if (this.player)
      this.player.dispose();
  }
}
</script>

<style lang="less">
  @primaryColor: #01DEBD;
  @primaryBackGround: rgba(255, 255, 255, 0.2);
  .juggle-video {
    .video {
      .video-js {
        .vjs-tech {
          background-size: 100%;
          background-repeat: repeat;
          background-position: 50% 50%;
        }
        .vjs-time-control {
          display:block
        }
        .vjs-big-play-button {
          height: 2em;
          width: 2em;
          line-height: 2em;
          border-radius: 2em;
        }
        .vjs-control-bar {
          background-color: transparent;
          .vjs-download {
            font-size: 1em;
            line-height: 3.2em;
            text-align: center;
            margin: 0 10px 0 10px;
            cursor: pointer;
          }
          .vjs-control-text {
            display: none;
          }
        }
        .vjs-load-progress {
          background: @primaryBackGround;
        }
        .vjs-play-progress {
          background: @primaryColor;
          &:before {
            color: @primaryColor;
            top: -0.4em;
          }
        }
        .vjs-slider {
          background-color: @primaryBackGround;
        }
        .vjs-volume-panel {
          .vjs-volume-control.vjs-volume-vertical {
            background: rgba(0, 0, 0, 0.6);
          }
        }
        .vjs-volume-level {
          background: @primaryColor;
        }
      }
    }
    .vjs-paused .vjs-big-play-button,
    .vjs-paused.vjs-has-started .vjs-big-play-button {
      display: block;
    }
  }
  .video-js .vjs-control-text {
    display: none;
  }
  .vjs-hover {
    background: @primaryColor;
  }
  .vjs-slider-vertical {
    .vjs-volume-level {
      &:before {
        left: -0.4em;
      }
    }
  }
  .vjs-menu {
    &-content {
      background: rgba(0, 0, 0, 0.6) !important;
    }
    li {
      color: #fff;
      &.vjs-selected {
        background: rgba(0, 0, 0, 0.6);
        color: @primaryColor;
      }
      &:hover {
        color: @primaryColor;
        background: rgba(0, 0, 0, 0.6);
      }
    }
  }
</style>
