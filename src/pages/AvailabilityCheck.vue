<template>
  <q-page v-if="state.loaded">
    <q-tabs
      v-model="state.tab"
      class="q-mb-md"
      align="justify"
      active-color="secondary"
      indicator-color="secondary"
    >
      <q-tab
        v-for="centre in userStore.user?.adminCentre"
        :key="centre"
        :name="centre"
        :label="centre"
      />
    </q-tabs>

    <q-tab-panels v-model="state.tab" animated>
      <q-tab-panel
        v-for="centre in userStore.user?.adminCentre"
        :key="centre"
        :name="centre"
        class="q-pa-none"
      >
        <FillAvailability :centre="centre" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import FillAvailability from 'src/components/Availability/FillAvailability.vue';
import { onMounted, reactive } from 'vue';
import { useAvailabilityStore } from 'src/stores/availabilityStore';
import { Loading } from 'quasar';
import { useUserStore } from 'src/stores/userStore';

const availabilityStore = useAvailabilityStore();
const userStore = useUserStore();

const state = reactive({
  loaded: false,
  tab: '',
});

onMounted(async () => {
  userStore.getUserInfo();
  Loading.show({
    message: 'Loading responses...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });

  if (userStore.user?.adminCentre && userStore.user.adminCentre.length > 0) {
    state.tab = userStore.user.adminCentre[0];
  }

  await availabilityStore.loadResponsesForUser();
  state.loaded = true;
  Loading.hide();
});
</script>


