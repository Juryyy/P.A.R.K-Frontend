<template>
    <q-card class="form-card">
      <q-form ref="passwordForm">
       <p class="text-h5">Password update</p>
        <q-input
          v-model="state.username"
          label="Username"
          autocomplete="username"
          style="display:none;"
        />
        <q-input
          filled
          v-model="state.password"
          label="Old Password"
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
        <q-input
          filled
          v-model="state.NewPassword"
          label="New Password"
          lazy-rules
          :type="state.NewPasswordHidden? 'password' : 'text'"
          :rules="[
            (val) => !!val || 'Password is required',
            (val) => val === state.NewPasswordCheck || 'Passwords must match'
          ]"
          autocomplete="new-password"
        >
          <template v-slot:append>
            <q-icon
              :name="state.NewPasswordHidden ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="state.NewPasswordHidden = !state.NewPasswordHidden"
            />
          </template>
        </q-input>
        <q-input
          filled
          v-model="state.NewPasswordCheck"
          label="Password Check"
          lazy-rules
          :type="state.NewPasswordCheckHidden ? 'password' : 'text'"
          :rules="[
            (val) => !!val || 'Password is required',
            (val) => val === state.NewPassword || 'Passwords must match'
          ]"
          autocomplete="new-password"
        >
          <template v-slot:append>
            <q-icon
              :name="state.NewPasswordCheckHidden ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="state.NewPasswordCheckHidden = !state.NewPasswordCheckHidden"
            />
          </template>
        </q-input>
        <q-card-actions class="actions-container">
          <q-btn
            color="primary"
            label="Update Password"
            type="submit"
            @click="update"
            :loading="state.loading"
            :disable="state.loading"
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
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { QForm } from 'quasar';

const authStore = useAuthStore();
const passwordForm = ref<QForm | null>(null);

const state = reactive({
  username: '',
  password: '',
  NewPassword: '',
  NewPasswordCheck: '',
  passwordHidden: true,
  NewPasswordHidden: true,
  NewPasswordCheckHidden: true,
  loading: false,
});

const update = async () => {
  state.loading = true;

  if (passwordForm.value) {
    const isValid = await passwordForm.value.validate();

    if (!isValid) {
      state.loading = false;
      return;
    }

    if (state.NewPassword !== state.NewPasswordCheck) {
      state.loading = false;
      return;
    }

    try {
      await authStore.updatePassword(state.password, state.NewPassword);
    } catch (error) {
      console.error(error);
    } finally {
      state.loading = false;
    }
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

.q-form {
  padding: 1.5rem;
}

@media (max-width: 600px) {
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
