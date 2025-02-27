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
import { onMounted, reactive} from 'vue';
import CreateAvailability from 'src/components/Availability/CreateAvailability.vue';
import { CentreEnum } from 'src/db/types';
import { useUser } from 'src/composables/useUser';
import { useExamDay } from 'src/composables/useExamDay';


const centres = Object.values(CentreEnum);

const state = reactive({
  loaded: false,
  tab: '',
});

onMounted(async () => {
  const user = useUser().getUserInfo();

  for (const centre of user?.adminCentre) {
    await useExamDay().loadExamDays(centre);
  }

  if (useUser().user?.adminCentre && useUser().user.adminCentre.length > 0) {
    state.tab = useUser().user.adminCentre[0];
  } else {
    state.tab = centres[0];
  }

  state.loaded = true;
});
</script>
