<template>
  <q-page class="flex flex-center login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="text-h4 q-mb-md">
          P<span class="red-dot">·</span>A<span class="red-dot">·</span>R<span class="red-dot">·</span>K<span class="red-dot">·</span> Application
        </h1>
        <p class="text-subtitle1 q-mb-lg">Secure access to your administrative tools</p>
      </div>
      <q-card class="login-card">
        <q-card-section>
          <p class="text-h6 q-mb-md">Login details</p>
          <q-form v-if="!isCodeVerification && !isForgotPassword" @submit="onSubmit" class="">
            <q-input
              filled
              v-model="state.email"
              label="Email"
              type="email"
              lazy-rules
              :rules="[(val) => !!val || 'Email is required']"
            />

            <q-input
              filled
              v-model="state.password"
              label="Password"
              :type="state.passwordHidden ? 'password' : 'text'"
              lazy-rules
              :rules="[(val) => !!val || 'Password is required']"
            >
              <template v-slot:append>
                <q-icon
                  :name="state.passwordHidden ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="state.passwordHidden = !state.passwordHidden"
                />
              </template>
            </q-input>

            <div class="row justify-between items-center">
              <q-btn label="Forgot Password?" flat color="primary" @click="isForgotPassword = true" />
              <q-btn
                label="Login"
                type="submit"
                color="primary"
                :loading="auth.loading.value"
                :disable="isAccountLocked"
              >
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </div>

            <!-- Account lockout message -->
            <div v-if="isAccountLocked" class="text-negative q-mt-md">
              <q-icon name="lock" class="q-mr-xs" />
              Account is temporarily locked due to too many failed attempts.
              Please try again later or reset your password.
            </div>
          </q-form>

          <q-form v-else-if="isCodeVerification">
            <p class="text-h6 q-mb-md">Enter the code sent to your email</p>
            <div class="verification-code-container q-mb-md">
              <q-input
                v-model="verificationCode"
                type="text"
                maxlength="8"
                @input="formatVerificationCode"
                class="verification-code-input"
                :rules="[val => val.length === 8 || 'Please enter all 8 digits']"
              />
              <div class="verification-code-display">
                <span
                  v-for="(digit, index) in displayCode"
                  :key="index"
                  class="code-digit"
                  :class="{ 'code-digit-filled': digit !== ' ' }"
                >
                  {{ digit }}
                </span>
              </div>
            </div>
            <div class="row justify-between q-mt-md">
              <q-btn
                flat
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
                :loading="auth.loading.value"
                :disable="auth.loading.value || verificationCode.length !== 8"
              >
                <template v-slot:loading>
                  <q-spinner size="20px" />
                </template>
              </q-btn>
            </div>
          </q-form>

          <q-form v-if="isForgotPassword">
            <p class="text-h6 q-mb-md">Reset Password</p>
            <q-input
              filled
              v-model="state.email"
              label="Email"
              type="email"
              lazy-rules
              :rules="[(val) => !!val || 'Email is required']"
            />
            <div class="row justify-between q-mt-md">
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
                @click="handlePasswordReset"
                :loading="auth.loading.value"
                :disable="auth.loading.value"
              >
                <template v-slot:loading>
                  <q-spinner size="20px" />
                </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from 'src/composables/useAuth';

const router = useRouter();
const auth = useAuth();

const state = reactive({
  email: '',
  password: '',
  passwordHidden: true,
});

const isCodeVerification = ref(false);
const isForgotPassword = ref(false);
const verificationCode = ref('');
const isAccountLocked = computed(() => useAuth().isLocked);

const displayCode = computed(() => {
  const code = verificationCode.value.padEnd(8, ' ');
  return code.split('');
});

const formatVerificationCode = () => {
  verificationCode.value = verificationCode.value.replace(/[^0-9]/g, '').slice(0, 8);
};

watch(() => useAuth().verification, (newValue) => {
  isCodeVerification.value = newValue;
});

const validate = async (event: Event) => {
  event.preventDefault();
  if (verificationCode.value.length !== 8) return;

  const success = await useAuth().verifyCode(state.email, verificationCode.value);
  if (success) {
    router.push('/');
  }
};

const onSubmit = async (event: Event) => {
  if (!state.email || !state.password) {
    return;
  }

  if (isAccountLocked.value) {
    return;
  }

  event.preventDefault();
  const success = await useAuth().login(state.email, state.password);
  if (success) {
    isCodeVerification.value = true;
  }
};

const handlePasswordReset = async (event: Event) => {
  if (!state.email) {
    return;
  }
  event.preventDefault();

  const success = await useAuth().resetPassword(state.email);
  if (success) {
    clear();
  }
};

const clear = () => {
  isCodeVerification.value = false;
  isForgotPassword.value = false;
  state.email = '';
  state.password = '';
  verificationCode.value = '';
};
</script>

<style lang="scss" scoped>
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.login-container {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  text-align: center;
}

.login-header {
  margin-bottom: 2rem;
  color: #34495e;

  h1 {
    font-weight: 700;
  }

  p {
    opacity: 0.8;
  }
}

.red-dot {
  color: red;
  font-weight: bold;
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.verification-code-container {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  height: 60px;
  cursor: text;
}

.verification-code-input {
  width: 100%;
  height: 100%;
  font-size: 24px;
  letter-spacing: 29px; /* Adjusted for 8 digits */
  padding-left: 15px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  opacity: 0;
  background: transparent;
}

.verification-code-display {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.code-digit {
  position: relative;
  width: 32px; /* Slightly smaller for 8 digits */
  height: 100%;
  font-size: 20px; /* Slightly smaller for 8 digits */
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  transition: all 0.3s ease;
}

.code-digit-filled {
  border-color: #1976D2;
  background-color: #E3F2FD;
}

.code-digit-cursor {
  position: absolute;
  width: 2px;
  height: 24px;
  background-color: #1976D2;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.verification-code-container:hover .code-digit:not(.code-digit-filled) {
  border-color: #1976D2;
}

.verification-code-input:focus + .verification-code-display .code-digit {
  border-color: #1976D2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.verification-code-container:hover .code-digit:not(.code-digit-filled) {
  animation: pulse 1s infinite;
}

@media (max-width: 600px) {
  .login-container {
    padding: 1rem;
  }
}
</style>
