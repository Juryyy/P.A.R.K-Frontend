<template>
  <q-card class="absolute-center">
    <q-form>
      <q-input
        filled
        v-model="state.email"
        label="Email"
        lazy-rules
        :rules="[val => !!val || 'Email is required']"
      />
      <q-input
        filled
        v-model="state.password"
        label="Password"
        lazy-rules
        :rules="[val => !!val || 'Password is required']"
      />
      <q-card-actions
      align="right"
      >
        <q-btn
          flat
          label="Forgot password?"
          color="primary"
          to="/forgot-password"
        />
        <q-btn
        class="q-mt-md"
        color="primary"
        label="Login"
        type="submit"
        @click="login($event)"
      />
      <q-btn
        class="q-mt-md"
        color="primary"
        label="Reset"
        type="reset"
        @click="reset"/>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { router } from 'src/router/index';
import { useAuthStore } from 'src/stores/authStore';
import { useUserStore } from 'src/stores/userStore';
import { Cookies } from 'quasar';

const userStore = useUserStore();
const authStore = useAuthStore();

const state = reactive({
  email: '',
  password: '',
});

const login = async (event: Event) => {
  event?.preventDefault();
  await authStore.login(state.email, state.password);
  if (Cookies.has('id')) {
    router.push('/');
  }
};

const reset = () => {
  state.email = '';
  state.password = '';
};


</script>
<style lang="scss" scoped>
.q-card {
  max-width: 400px;
  margin: 0 auto;
}

.q-form {
  padding: 1rem;
}
</style>
