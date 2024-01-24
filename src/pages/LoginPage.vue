<template>
  <div class="login-page">
  <LoginForm/>
  </div>
</template>

<script setup lang="ts">
import LoginForm from 'src/components/Auth_nav/LoginForm.vue';
</script>

<style lang="scss" scoped>
.login-page {
  background-color: $primary;
  min-height: 100vh;
}
</style>
