<template>
  <div class="login-page">
    <VerifyForm />
  </div>
</template>
<script setup lang="ts">
import VerifyForm from 'src/components/Auth_nav/VerifyForm.vue';
</script>

<style lang="scss" scoped>
.login-page {
  background-color: $primary;
  min-height: 100vh;
}
</style>
