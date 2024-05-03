<template>
  <q-card class="absolute-center" v-if="!Login">
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
      </q-card-actions>
    </q-form>
  </q-card>

  <q-card class="absolute-center" v-if="Login">
      <q-form>
        <h4 class="text-h6">Enter the code sent to your email</h4>
        <!-- Create input box for number, but that number will be shown as 6 boxes seperated-->
        <q-input
          filled
          v-model="state.code"
          label="Enter Code"
          lazy-rules
          :rules="[(val) => !!val || 'Code is required']"
          autocomplete="code"
          class="inputCode"
          maxlength="6"
          type="number"
        />
        <q-card-actions align="right">
          <q-btn
            class="q-mt-md"
            color="primary"
            label="Submit"
            type="submit"
            @click="validate($event)"
          />
        </q-card-actions>
      </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { router } from 'src/router/index';
import { useAuthStore } from 'src/stores/authStore';
import { ref } from 'vue';

const authStore = useAuthStore();

const state = reactive({
  email: '',
  password: '',
  passwordHidden: true,
  code: ''
});

const Login = ref(false);

const login = async (event: Event) => {
  event?.preventDefault();
  await authStore.login(state.email, state.password);
  Login.value = true;
};

const validate = async (event: Event) => {
  event?.preventDefault();
  await authStore.verifyUser(state.email, state.code);
  if (localStorage.getItem('id')) {
    router.push('/');
  }
};

</script>
<style lang="scss" scoped>
.q-card {
  max-width: 400px;
  margin: 0 auto;
}

.q-form {
  padding: 1.5rem;
}

.inputCode >>> input[type="number"] {
  -moz-appearance: textfield;
}
.inputCode >>> input::-webkit-outer-spin-button,
.inputCode >>> input::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
</style>
