<template>
  <q-tabs
    v-model="tab"
    class="q-mb-md"
    align="justify"
    active-color="primary"
    indicator-color="primary"
  >
    <q-tab name="exams" label="Exams" />
    <q-tab name="locations" label="Locations" />
  </q-tabs>
  <q-tab-panels v-model="tab">
    <q-tab-panel name="locations" v-if=loaded class="cards-container">
      <LocationsVenues/>
    </q-tab-panel>
    <q-tab-panel name="exams" v-if=loaded class="cards-container">

      <q-select
        v-model="selectedCentre"
        :options="centres"
        label="Centre"
        emit-value
        map-options
        use-input
        hide-selected
        fill-input
        dense
        class="q-mb-md"
      ></q-select>
      <ExamsList :centre="selectedCentre"/>
    </q-tab-panel>
  </q-tab-panels>

</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import LocationsVenues from 'src/components/Admin/LocationsVenues.vue';
import ExamsList from 'src/components/Admin/ExamsList.vue';
import { CentreEnum } from 'src/db/types';
import { useAdmin } from 'src/composables/useAdmin';

const selectedCentre = ref<CentreEnum>(CentreEnum.Brno);
const centres = Object.values(CentreEnum).map((value) => ({ label: value, value }));
const tab = ref('locations');
const loaded = ref(false);

onBeforeMount(async () => {
  loaded.value = false;
  await useAdmin().getLocationsWithVenues();
  loaded.value = true;
});

</script>
<style lang="scss" scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;
}

@media screen and (max-width: 600px) {
  .cards-container {
    flex-direction: column;
  }
}
</style>
