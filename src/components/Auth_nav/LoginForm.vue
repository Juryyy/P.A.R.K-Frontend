<template>
  <q-card class="absolute-center">
    <q-form>
      <q-input
        filled
        v-model="state.email"
        label="Email"
        lazy-rules
        :rules="[(val) => !!val || 'Email is required']"
        autocomplete="email"
      />
      <q-input
        filled
        v-model="state.password"
        label="Password"
        lazy-rules
        :type="state.passwordHidden ? 'password' : 'text'"
        :rules="[(val) => !!val || 'Password is required']"
        autocomplete="current-password"
      >
        <template v-slot:append>
          <q-icon
            :name="state.passwordHidden ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="state.passwordHidden = !state.passwordHidden"
          />
        </template>
      </q-input>
      <q-card-actions align="right">
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
          @click="reset"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { router } from 'src/router/index';
import { useAuthStore } from 'src/stores/authStore';

const authStore = useAuthStore();

const state = reactive({
  email: '',
  password: '',
  passwordHidden: true,
});

const login = async (event: Event) => {
  event?.preventDefault();
  await authStore.login(state.email, state.password);
  if (localStorage.getItem('id')) {
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
