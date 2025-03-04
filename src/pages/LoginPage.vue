<template>
  <q-layout class="login-page">
    <q-page-container>
      <LoginForm />
    </q-page-container>
  </q-layout>
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
