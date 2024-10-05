<template>
  <q-page class="flex-center">
    <q-card class="form-card">
      <q-form v-if="!isCodeVerification && !isForgotPassword">
        <p class="text-h5">Login required</p>
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
        <q-card-actions class="actions-container">
          <q-btn
            flat
            label="Forgot password?"
            color="primary"
            @click="isForgotPassword = true"
          />
          <q-btn
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

      <q-form v-else-if="isCodeVerification">
        <p class="text-h6">Enter the code sent to your email</p>
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
        <q-card-actions class="actions-container">
          <q-btn
            flat
            align="left"
            icon="arrow_back"
            label="Back"
            color="primary"
            @click="clear()"
          />
          <q-btn
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

      <q-form v-else>
        <p class="text-h5">Reset Password</p>
        <q-input
          filled
          v-model="state.email"
          label="Email"
          lazy-rules
          :rules="[(val) => !!val || 'Email is required']"
          autocomplete="email"
        />
        <q-card-actions class="actions-container">
          <q-btn
            flat
            icon="arrow_back"
            label="Back"
            color="primary"
            @click="clear()"
          />
          <q-btn
            color="primary"
            label="Reset Password"
            type="submit"
            @click="resetPassword"
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
  </q-page>
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
const isForgotPassword = ref(false);
const loading = ref(false);
const code = ref(['', '', '', '', '', '']);

const login = async (event: Event) => {
  if (!state.email || !state.password) {
    return;
  }
  event.preventDefault();
  loading.value = true;
  try {
    await authStore.login(state.email, state.password);
    if (authStore.verification === true ) {
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
      await userStore.getUsersExams();
      router.push('/');
    }
  } finally {
    loading.value = false;
  }
};

const resetPassword = async (event: Event) => {
  if (!state.email) {
    return;
  }
  event.preventDefault();
  loading.value = true;
  try {
    await authStore.resetPassword(state.email);
  } finally {
    loading.value = false;
    const mail = state.email;
    clear();
    state.email = mail;
    isForgotPassword.value = false;
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

const clear = () => {
  isCodeVerification.value = false;
  isForgotPassword.value = false;
  state.email = '';
  state.password = '';
  state.code = '';
  code.value = ['', '', '', '', '', ''];
};
</script>

<style lang="scss" scoped>
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.form-card {
  max-width: 400px;
  width: 100%;
  margin: 0 1rem;
  padding: 1rem;
}

.q-form {
  padding: 1.5rem;
}

@media (max-width: 600px) {
  .form-card {
    padding: 1rem;
  }

  .q-form {
    padding: 1rem;
  }
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

.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.actions-container q-btn {
  margin-top: 0 !important;
}
</style>
