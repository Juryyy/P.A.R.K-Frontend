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
          (val) => val !== state.password || 'New password must be different from the old one',
          (val) => val.length >= 8 || 'Password must be at least 8 characters long',
          (val) => /[A-Z]/.test(val) || 'Password must contain at least one uppercase letter',
          (val) => /[a-z]/.test(val) || 'Password must contain at least one lowercase letter',
          (val) => /[0-9]/.test(val) || 'Password must contain at least one number',
          (val) => /[^A-Za-z0-9]/.test(val) || 'Password must contain at least one special character',
          (val) => !commonPasswordCheck(val) || 'This password is too common. Please choose a more unique password.'
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
          :disable="!isPasswordStrong"
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
import { useAuthStore } from '../../stores/authStore';
import { QForm, Notify, Loading } from 'quasar';
import { useUserStore } from 'src/stores/userStore';

const emit = defineEmits(['password-updated']);

const authStore = useAuthStore();
const userStore = useUserStore();
const passwordForm = ref<QForm | null>(null);

const state = reactive({
  password: '',
  newPassword: '',
  newPasswordCheck: '',
  passwordHidden: true,
  newPasswordHidden: true,
  newPasswordCheckHidden: true,
});

const commonPasswordCheck = (password: string): boolean => {
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];
  return commonPasswords.includes(password.toLowerCase());
};

const isPasswordStrong = computed(() => {
  const { newPassword } = state;
  const password = newPassword.length >= 8 &&
         /[A-Z]/.test(newPassword) &&
         /[a-z]/.test(newPassword) &&
         /[0-9]/.test(newPassword) &&
         /[^A-Za-z0-9]/.test(newPassword) &&
         !commonPasswordCheck(newPassword);
  return password;
});

const update = async () => {
  if (!passwordForm.value) return;

  try {
    await passwordForm.value.validate();
  } catch (error) {
    return;
  }

  Loading.show();

  try {
    await authStore.updatePassword(state.password, state.newPassword);
    Notify.create({
      type: 'positive',
      message: 'Password updated successfully'
    });
    // Clear the form after successful update
    state.password = '';
    state.newPassword = '';
    state.newPasswordCheck = '';
    // Emit event to notify parent to switch tabs
    await authStore.getToken();
    userStore.getUserInfo();
    await userStore.getProfile(Number(userStore.user.id));
    if (userStore.user?.id) {
      userStore.updatePasswordStatus();
      await userStore.getProfile(Number(userStore.user.id));
    }
    emit('password-updated');
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Failed to update password. Please try again.'
    });
  } finally {
    Loading.hide();
  }
};
</script>

<style lang="scss" scoped>
.form-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
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
