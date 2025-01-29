<template>
  <q-page v-if="state.isLoaded">
    <q-tabs
      v-model="state.tab"
      class="q-mb-md"
      align="justify"
      active-color="secondary"
      indicator-color="secondary"
    >
      <q-tab
        v-for="centre in CentreEnum"
        :key="centre"
        :name="centre"
        :label="centre"
      />
    </q-tabs>

    <q-tab-panels v-model="state.tab" animated>
      <q-tab-panel
        v-for="centre in CentreEnum"
        :key="centre"
        :name="centre"
        class="q-pa-none"
      >
        <ExamListCal :centre="centre" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import ExamListCal from 'src/components/Exams/ExamListCal.vue';
import { onMounted, reactive } from 'vue';
import { useExamDayStore } from 'src/stores/examDayStore';
import { Loading } from 'quasar';
import { useExamStore } from 'src/stores/examStore';
import { useAdminStore } from 'src/stores/adminStore';
import { useUserStore } from 'src/stores/userStore';
import { CentreEnum } from 'src/db/types';

const examDayStore = useExamDayStore();
const adminStore = useAdminStore();
const examStore = useExamStore();
const userStore = useUserStore();

const state = reactive({
  isLoaded: false,
  tab: '',
});

onMounted(async () => {
  Loading.show({
    message: 'Loading exam days...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });

  for (const centre of Object.values(CentreEnum)) {
    await examDayStore.loadExamDays(centre);
  }

  if (userStore.user?.adminCentre && userStore.user.adminCentre.length > 0) {
    state.tab = userStore.user.adminCentre[0];
  }
  state.isLoaded = true;
  Loading.hide();
});
</script>
<style lang="scss" scoped></style>
