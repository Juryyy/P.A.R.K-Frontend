<template>
  <q-card class="q-ma-md" v-for="location in locationsRef" :key="location.id">
    <q-card-section>
        <h4>{{ location.name }}</h4>
      <table class="venue-table">
        <thead>
          <tr>
            <th>Venue</th>
            <th>On map</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venue in location.venues" :key="venue.id">
            <td><b>{{ venue.name }}</b></td>
            <td>
            <q-btn color="primary" icon="map" @click="showVenue(venue.gLink)"/>
            </td>
            <td>
              <q-btn @click="removeVenue(venue.id)" color="negative" icon="delete" />
            </td>
          </tr>
        </tbody>
      </table>
      <q-btn class="q-my-md float-right"  label="+" color="primary" @click="showVenueDialog(location.id)" />
    </q-card-section>
  </q-card>
  <div class="q-ma-md allign-bottom">
    <q-btn class="q-ma-sm" label="Add Location" color="primary" @click="state.showLocation = true" />
    <q-icon color="primary" name="help" size="xs">
      <q-tooltip color="primary" class="bg-primary">Location is a general place, like Brno, Praha or Zlín <br>Venue is the actual place, ex. Biskupské gymnázium, with full address</q-tooltip>
    </q-icon>
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

  <q-dialog v-model="state.showVenue">
    <q-card>
      <q-card-section>
        <h4 class="text-center" v-if="selectedLocation">{{selectedLocation.name}}</h4>
        <div style="display: flex; align-items: center;">
          <q-input v-model="venueName" label="Venue Name" />
          <q-btn icon="map" color="primary" @click="showMap" />
        </div>
         <q-input v-model="venueLink" label="Venue Link" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Cancel" color="red" @click="state.showVenue = false" />
        <q-btn label="Add Venue" color="primary" @click="addVenue(selectedLocation!)" />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>


<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAdminStore } from 'src/stores/adminStore';
import { Location } from 'src/db/types';
import { Loading, Notify, Dialog } from 'quasar';

const adminStore = useAdminStore();

const locations: Location[] = adminStore.locationsWithVenues;
const locationsRef = ref(locations);
const selectedLocation = ref<Location>();
const venueName = ref('');
const venueLink = ref('');
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

const addVenue = async (location: Location) => {
  if (!location) {
    throw new Error('No location selected');
  }
  Loading.show({ message: 'Adding venue', spinnerSize: 140, spinnerColor: 'amber', backgroundColor: 'black'});

  await adminStore.addVenue(location.id, venueName.value, venueLink.value);
  venueName.value = '';
  venueLink.value = '';
  await adminStore.getLocationsWithVenues();
  locationsRef.value = adminStore.locationsWithVenues;
  state.showVenue = false;
  Loading.hide();
};

const removeVenue = async (venue: number) => {
  Dialog.create({
    title: 'Remove Venue',
    message: 'Are you sure?',
    ok: {
      label: 'Yes',
      color: 'positive',
    },
    cancel: {
      label: 'No',
      color: 'negative',
    },
  }).onOk(async () => {
    Loading.show({ message: 'Removing venue', spinnerSize: 140, spinnerColor: 'amber', backgroundColor: 'black'});
    await adminStore.removeVenue(venue);
    await adminStore.getLocationsWithVenues();
    locationsRef.value = adminStore.locationsWithVenues;
    Loading.hide();
  });
};

const showVenueDialog = (locationId: number) => {
  const location = locationsRef.value.find(loc => loc.id === locationId);
  if (location) {
    selectedLocation.value = location;
    state.showVenue = true;
  } else {
    Notify.create({
      message: 'Location not found',
      color: 'negative',
      position: 'top',
      timeout: 2000,
    });
  }
};

const showMap = () => {
  const url = `https://www.google.com/maps?q=${encodeURIComponent(
    venueName.value
  )}`;
  window.open(url, '_blank');
}

const showVenue = (gLink : string) => {
  window.open(gLink, '_blank');
}


</script>
<style scoped>
.venue-table {
  width: 100%;
  border-collapse: collapse;
}

.venue-table th, .venue-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.venue-table th {
  background-color: #f2f2f2;
}
</style>
