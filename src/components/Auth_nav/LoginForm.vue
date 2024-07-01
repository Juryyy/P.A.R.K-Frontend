<template>
  <q-card class="absolute-center">
    <q-form v-if="!isCodeVerification">
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
          @click="login"
          :loading="loading"
          :disable="loading"
        >
          <template v-slot:loading>
            <q-spinner size="20px" />
          </template>
        </q-btn>
      </q-card-actions>
    </q-form>

    <q-form v-else>
      <h4 class="text-h6">Enter the code sent to your email</h4>
      <div class="code-inputs">
        <input
          v-for="(digit, index) in code"
          :key="index"
          v-model="code[index]"
          maxlength="1"
          @paste="handlePaste"
          @input="handleInput(index)"
          type="text"
          class="code-input"
        />
      </div>
      <q-card-actions align="right">
        <q-btn
          class="q-mt-md"
          color="primary"
          label="Submit"
          type="submit"
          @click="validate"
          :loading="loading"
          :disable="loading"
        >
          <template v-slot:loading>
            <q-spinner size="20px" />
          </template>
        </q-btn>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { useUserStore } from 'src/stores/userStore';

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const state = reactive({
  email: '',
  password: '',
  passwordHidden: true,
  code: ''
});

const isCodeVerification = ref(false);
const loading = ref(false);
const code = ref(['', '', '', '', '', '']);

const login = async (event: Event) => {
  event.preventDefault();
  loading.value = true;
  try {
    await authStore.login(state.email, state.password);
    if (authStore.verification) {
      isCodeVerification.value = true;
    }
  } finally {
    loading.value = false;
  }
};

const validate = async (event: Event) => {
  event.preventDefault();
  loading.value = true;
  try {
    state.code = code.value.join('');
    await authStore.verifyUser(state.email, state.code);
    if (localStorage.getItem('id')) {
      userStore.getUserInfo();
      await userStore.getUsersAvatar();
      router.push('/');
    }
  } finally {
    loading.value = false;
  }
};

const handlePaste = (event: ClipboardEvent) => {
  const paste = event.clipboardData?.getData('text') || '';
  code.value = paste.split('').slice(0, 6);
};

const handleInput = (index: number) => {
  if (index < 5 && code.value[index]) {
    const nextInput = document.querySelectorAll<HTMLInputElement>('.code-input')[index + 1];
    nextInput?.focus();
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

.code-inputs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.code-input {
  width: 40px;
  height: 40px;
  font-size: 24px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
