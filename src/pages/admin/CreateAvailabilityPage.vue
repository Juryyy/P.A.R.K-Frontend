<template>
  <q-page v-if="state.loaded">
    <q-tabs
      v-model="state.tab"
      class="q-mb-md"
      align="justify"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab
        v-for="centre in centres"
        :key="centre"
        :name="centre"
        :label="centre"
      />
    </q-tabs>

    <q-tab-panels v-model="state.tab" v-if="state.loaded" animated>
      <q-tab-panel
        v-for="centre in centres"
        :key="centre"
        :name="centre"
        class="cards-container"
      >
        <CreateAvailability :centre="centre" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { useExamDayStore } from 'src/stores/examDayStore';
import { onMounted, reactive, ref } from 'vue';
import { Loading } from 'quasar';
import CreateAvailability from 'src/components/Availability/CreateAvailability.vue';
import { useUserStore } from 'src/stores/userStore';
import { CentreEnum } from 'src/db/types';

const examDayStore = useExamDayStore();
const userStore = useUserStore();

const centres = Object.values(CentreEnum);

const state = reactive({
  loaded: false,
  tab: '',
});

onMounted(async () => {
  userStore.getUserInfo();
  Loading.show({
    message: 'Loading exam days...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });

  if (userStore.user?.adminCentre && userStore.user.adminCentre.length > 0) {
    state.tab = userStore.user.adminCentre[0];
  } else {
    state.tab = centres[0];
  }

  state.loaded = true;
  Loading.hide();
});
</script>
