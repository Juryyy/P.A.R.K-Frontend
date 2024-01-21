<template>
  <div class="login-page">
  <LoginForm/>
  </div>
</template>

<script setup lang="ts">
import LoginForm from 'src/components/LoginForm.vue';
</script>

<style lang="scss" scoped>
.login-page {
  background-color: $primary; // replace #your-color with the color you want
  min-height: 100vh; // this ensures the background color covers the entire height of the viewport
}
</style>
