<template>
  <div class="app-main2">
    <!-- <transition name="fade" mode="out-in"> -->
    <!-- <keep-alive> -->
    <!-- <router-view></router-view> -->
    <!-- </keep-alive> -->
    <!-- </transition> -->
    <!-- 
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view> -->

    <empty></empty>
  </div>
</template>

<script>
import empty from './empty.vue';
export default {
  components: { empty },
  name: 'app-main',
};
</script>
