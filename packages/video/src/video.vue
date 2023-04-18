<template>
  <div class="juggle-video">
    <VideoPlayer :options="videoOptions" ref="videoPlayer" @play="play" @end="end" @pause="pause"></VideoPlayer>
  </div>
</template>

<script>
import VideoPlayer from './createVideo.vue';
export default {
  name: 'juggle-video',
  emits: ['play', 'end', 'pause'],
  components: {
    VideoPlayer
  },
  props: {
    videoOptions: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    getCurrentTimes() {
      return this.$refs.videoPlayer.getCurrentTimes();
    },
    getTotalTimes() {
      return this.$refs.videoPlayer.getTotalTimes();
    },
    play(currentTimes, totalTimes) {
      this.$emit('play', currentTimes, totalTimes);
    },
    end() {
      this.$emit('end');
    },
    pause() {
      this.$emit('pause');
    }
  }
}
</script>
