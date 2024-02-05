<template>
  <q-card v-for="location in locationsRef" :key="location.id">
    <q-card-section>
      <h4>{{ location.name }}</h4>
      <div v-for="venue in location.venues" :key="venue.id">
        <div>{{ venue.name }}</div>
    </div>
    </q-card-section>
  </q-card>

  <div class="q-ma-md allign-bottom">
    <q-btn label="Add Location" color="primary" @click="state.showLocation = true" />
  </div>
  <q-dialog v-model="state.showLocation">
    <q-card>
      <q-card-section>
        <q-input v-model="locationName" label="Location Name" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Cancel" color="red" @click="state.showLocation = false" />
        <q-btn label="Add Location" color="primary" @click="addLocation"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <div class="q-ma-md allign-bottom">
  <q-btn label="Add Venue" color="primary" @click="state.showVenue = true" />
  </div>
  <q-dialog v-model="state.showVenue">
    <q-card>
      <q-card-section>
        <q-select
          v-model="selectedLocation"
          :options="locationsRef"
          label="Select Location"
          option-value="id"
          option-label="name"
        />
        <q-input v-model="venueName" label="Venue Name" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Cancel" color="red" @click="state.showVenue = false" />
        <q-btn label="Add Venue" color="primary" @click="addVenue" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAdminStore } from 'src/stores/adminStore';
import { Location } from 'src/stores/db/types';
import { Loading } from 'quasar';

const adminStore = useAdminStore();

const locations: Location[] = adminStore.locationsWithVenues;
const locationsRef = ref(locations);
const selectedLocation = ref<Location | null>(null);
const venueName = ref('');
const locationName = ref('');

const state = reactive({
  showLocation: false,
  showVenue: false,
});

const addLocation = async () => {
  if (!locationName.value) {
    throw new Error('Location name is required');
  }
  Loading.show({ message: 'Adding location', spinnerSize: 140, spinnerColor: 'amber', backgroundColor: 'black'});
  await adminStore.addLocation(locationName.value);
  locationName.value = ''; // reset the input
  await adminStore.getLocationsWithVenues();
  locationsRef.value = adminStore.locationsWithVenues;
  state.showLocation = false;
  Loading.hide();
};

const addVenue = async () => {
  if (!selectedLocation.value) {
    throw new Error('No location selected');
  }
  const locationId = selectedLocation.value.id;
  const location = locationsRef.value.find((loc) => loc.id === locationId);
  if (location) {
    Loading.show({ message: 'Adding venue', spinnerSize: 140, spinnerColor: 'amber', backgroundColor: 'black'});
    await adminStore.addVenue(location.id, venueName.value);
    venueName.value = ''; // reset the input
    await adminStore.getLocationsWithVenues();
    locationsRef.value = adminStore.locationsWithVenues;
    state.showVenue = false;
    Loading.hide();
  } else {
    throw new Error(`Location with id ${locationId} not found`);
  }
};
</script>
