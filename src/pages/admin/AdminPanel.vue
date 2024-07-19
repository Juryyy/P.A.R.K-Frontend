<template>

  <q-tabs
    v-model="tab"
    class="q-mb-md"
    align="justify"
    active-color="primary"
    indicator-color="primary"
  >
    <q-tab name="locations" label="Locations" />
    <q-tab name="users" label="Users" />
  </q-tabs>
  <q-tab-panels v-model="tab">
    <q-tab-panel name="locations" v-if=loaded class="cards-container">
      <LocationsVenues/>
    </q-tab-panel>
    <q-tab-panel name="users" v-if=loaded>
      <UserList/>
    </q-tab-panel>
  </q-tab-panels>

</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import LocationsVenues from 'src/components/Admin/LocationsVenues.vue';
import UserList from 'src/components/Users/UserList.vue';
import { useAdminStore } from 'src/stores/adminStore';
import { Loading } from 'quasar';

const adminStore = useAdminStore();

const tab = ref('locations');
const loaded = ref(false);

onBeforeMount(async () => {
  loaded.value = false;
  Loading.show({
    message: 'Loading data',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  await adminStore.getLocationsWithVenues();
  Loading.hide();
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
