<template>
  <q-card class="form-card">
    <q-form ref="passwordForm" @submit="update">
      <p class="text-h5">Password update</p>
      <q-input
        v-model="state.password"
        label="Old Password"
        stack-label
        :type="state.passwordHidden ? 'password' : 'text'"
        :rules="[(val) => !!val || 'Password is required']"
        autocomplete="current-password"
        outlined
      >
        <template v-slot:append>
          <q-icon
            :name="state.passwordHidden ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="state.passwordHidden = !state.passwordHidden"
          />
        </template>
      </q-input>
      <q-input
        v-model="state.newPassword"
        label="New Password"
        stack-label
        :type="state.newPasswordHidden ? 'password' : 'text'"
        :rules="[
          (val) => !!val || 'Password is required',
          (val) => val !== state.password || 'New password must be different from the old one'
        ]"
        autocomplete="new-password"
        outlined
      >
        <template v-slot:append>
          <q-icon
            :name="state.newPasswordHidden ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="state.newPasswordHidden = !state.newPasswordHidden"
          />
        </template>
      </q-input>

      <!-- Password strength indicator -->
      <div class="password-requirements q-mb-md">
        <div class="text-subtitle2 q-mb-sm">Password Requirements:</div>
        <ul>
          <li v-for="req in passwordRequirements" :key="req.id"
              :class="{ 'text-positive': req.validate(state.newPassword), 'text-negative': !req.validate(state.newPassword) }">
            <q-icon :name="req.validate(state.newPassword) ? 'check_circle' : 'cancel'" size="xs" class="q-mr-xs" />
            {{ req.label }}
          </li>
        </ul>
      </div>

      <q-input
        v-model="state.newPasswordCheck"
        label="Confirm New Password"
        stack-label
        :type="state.newPasswordCheckHidden ? 'password' : 'text'"
        :rules="[
          (val) => !!val || 'Password confirmation is required',
          (val) => val === state.newPassword || 'Passwords must match'
        ]"
        autocomplete="new-password"
        outlined
      >
        <template v-slot:append>
          <q-icon
            :name="state.newPasswordCheckHidden ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="state.newPasswordCheckHidden = !state.newPasswordCheckHidden"
          />
        </template>
      </q-input>
      <q-card-actions class="actions-container">
        <q-btn
          color="primary"
          label="Update Password"
          type="submit"
          :disable="!isPasswordStrong || auth.loading.value"
          :loading="auth.loading.value"
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
import { ref, reactive, computed } from 'vue';
import { QForm } from 'quasar';
import { useAuth } from 'src/composables/useAuth';

const emit = defineEmits(['password-updated']);

const auth = useAuth();
const passwordForm = ref<QForm | null>(null);

const state = reactive({
  password: '',
  newPassword: '',
  newPasswordCheck: '',
  passwordHidden: true,
  newPasswordHidden: true,
  newPasswordCheckHidden: true,
});

// Common password check based on security standards
const commonPasswordCheck = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', 'qwerty', 'admin', 'letmein', 'welcome',
    'abc123', 'monkey', '1234567', 'password123', 'admin123', '123456789',
    'qwerty123', 'sunshine', 'princess', 'football'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return true;
  }

  const allSameChars = /^(.)\1+$/.test(password);
  const sequential = /^(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i.test(password);

  return allSameChars || sequential;
};

// Password requirements for visual feedback
const passwordRequirements = [
  {
    id: 'length',
    label: 'At least 8 characters',
    validate: (pass: string) => pass.length >= 8
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    validate: (pass: string) => /[A-Z]/.test(pass)
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    validate: (pass: string) => /[a-z]/.test(pass)
  },
  {
    id: 'number',
    label: 'At least one number',
    validate: (pass: string) => /\d/.test(pass)
  },
  {
    id: 'special',
    label: 'At least one special character',
    validate: (pass: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pass)
  },
  {
    id: 'common',
    label: 'Not a commonly used password',
    validate: (pass: string) => !commonPasswordCheck(pass)
  }
];

// Updated password strength check
const isPasswordStrong = computed(() => {
  return passwordRequirements.every(req => req.validate(state.newPassword)) &&
         state.newPassword !== state.password;
});

const update = async () => {
  if (!passwordForm.value) return;

  try {
    await passwordForm.value.validate();
  } catch (error) {
    return;
  }

  // Additional validation before submission
  if (!isPasswordStrong.value) {
    return;
  }

  const success = await auth.updatePassword(state.password, state.newPassword);

  if (success) {
    // Clear the form after successful update
    state.password = '';
    state.newPassword = '';
    state.newPasswordCheck = '';
    emit('password-updated');
  }
};
</script>

<style lang="scss" scoped>
.form-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.password-requirements {
  text-align: left;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 0.5rem;

  ul {
    list-style-type: none;
    padding-left: 0.5rem;
    margin: 0;
  }

  li {
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
  }
}

@media (max-width: 600px) {
  .form-card {
    max-width: 100%;
    margin: 0 1rem;
    padding: 1rem;
  }
}

.actions-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>
