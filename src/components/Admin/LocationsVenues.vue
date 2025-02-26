<template>
    <div class="q-pa-md">
      <!-- Filter Section -->
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-icon name="filter_list" color="grey-7" size="sm" />
        <q-chip
          clickable
          :selected="selectedCentres.includes('All')"
          @click="toggleFilter('All')"
          color="grey"
          text-color="white"
        >
          All
        </q-chip>
        <q-chip
          v-for="centre in Object.values(CentreEnum)"
          :key="centre"
          clickable
          :selected="selectedCentres.includes(centre)"
          @click="toggleFilter(centre)"
          color="grey"
          text-color="white"
        >
          {{ centre }}
        </q-chip>
      </div>

      <q-card class="q-mb-md location-card" v-for="location in filteredLocations" :key="location.id">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <h4 class="text-h5 q-my-none">{{ location.name }}</h4>
          <div>
            <q-chip v-for="centre in location.adminCentre" :key="centre" color="primary" text-color="white">{{ centre }}</q-chip>
          </div>
          <div>
            <q-btn flat round color="primary" icon="edit" @click="editLocationDialog(location)">
              <q-tooltip>Edit Location</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" @click="removeLocation(location.id)">
              <q-tooltip>Remove Location</q-tooltip>
            </q-btn>
          </div>
        </div>
        <q-table
          flat
          :rows="location.venues"
          :columns="columns"
          row-key="id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props">
                <div class="text-weight-medium">{{ props.row.name }}</div>
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row q-gutter-sm justify-end">
                  <q-btn flat round color="primary" icon="map" @click="showVenue(props.row.gLink)">
                    <q-tooltip>Open in Maps</q-tooltip>
                  </q-btn>
                  <q-btn flat round color="negative" icon="delete" @click="removeVenue(props.row.id)">
                    <q-tooltip>Remove Venue</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div class="text-right q-mt-sm">
          <q-btn flat round color="primary" icon="add" @click="showVenueDialog(location.id)">
            <q-tooltip>Add Venue</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <div class="row items-center q-gutter-sm">
      <q-btn unelevated color="primary" icon-right="add" label="Add Location" @click="state.showLocation = true" />
      <q-btn flat round color="primary" icon="help" size="sm">
        <q-tooltip class="bg-primary">
          Location is a general place, like Brno, Praha or Zlín
          <br>Venue is the actual place, ex. Biskupské gymnázium, with full address
        </q-tooltip>
      </q-btn>
    </div>
  </div>

  <LocationEdit
    v-model:show="state.editLocation"
    :location="selectedLocation!"
  />


  <!-- Add Location Dialog -->
  <q-dialog v-model="state.showLocation">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Add New Location</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="locationName" label="Location Name" autofocus />
        <q-select
          v-model="locationCentre"
          :options="Object.values(CentreEnum)"
          label="Admin Centre"
          class="q-mt-sm"
          clearable
          emit-value
          map-options
          multiple
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn unelevated label="Add Location" @click="addLocation" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Venue Dialog -->
  <q-dialog v-model="state.showVenue">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6" v-if="selectedLocation">Add Venue to {{selectedLocation.name}}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input v-model="venueName" label="Venue Name" class="q-mb-sm" />
          </div>
          <div class="col-12">
            <q-input v-model="venueLink" label="Venue Link">
              <template v-slot:append>
                <q-btn round flat icon="map" @click="showMap">
                  <q-tooltip>Search on Maps</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn unelevated label="Add Venue" @click="addVenue(selectedLocation!)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAdminStore } from 'src/stores/adminStore';
import { Location } from 'src/db/types';
import { Loading, Notify, Dialog } from 'quasar';
import { CentreEnum } from 'src/db/types';
import LocationEdit from './LocationEdit.vue';
import { storeToRefs } from 'pinia';

const adminStore = useAdminStore();

const { locationsWithVenues } = storeToRefs(adminStore);
const locations: Location[] = locationsWithVenues.value;
const locationsRef = ref(locations);
const selectedLocation = ref<Location>();
const venueName = ref('');
const venueLink = ref('');
const locationName = ref('');
const locationCentre = ref<CentreEnum[]>([]);
const selectedCentres = ref<string[]>(['All']);


const columns = [
  {
    name: 'name',
    label: 'Venue',
    field: 'name',
    align: 'left' as const,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'right' as const,
  }
];

const state = reactive({
  showLocation: false,
  showVenue: false,
  editLocation: false,
  editVenue: false,
});


const editLocationDialog = (location: Location) => {
  selectedLocation.value = location;
  state.editLocation = true;
};

const filteredLocations = computed(() => {
  if (selectedCentres.value.includes('All')) {
    return locationsRef.value;
  }
  return locationsRef.value.filter(location =>
    Array.isArray(location.adminCentre) && location.adminCentre.some(centre =>
      selectedCentres.value.includes(centre)
    )
  );
});

const toggleFilter = (centre: string) => {
  if (centre === 'All') {
    selectedCentres.value = ['All'];
    return;
  }

  if (selectedCentres.value.includes(centre)) {
    selectedCentres.value = ['All'];
  } else {
    selectedCentres.value = [centre];
  }
};

const addLocation = async () => {
  if (!locationName.value) {
    Notify.create({
      message: 'Location name is required',
      color: 'negative',
      position: 'bottom',
    });
    return;
  }
  Loading.show({
    message: 'Adding location',
    spinnerSize: 140,
    spinnerColor: 'primary',
    backgroundColor: 'grey-3'
  });

  try {
    if(!locationCentre.value) {
      Notify.create({
        message: 'Centre is required',
        color: 'negative',
        position: 'bottom',
      });
      return
    }
    await adminStore.addLocation(locationName.value, locationCentre.value);
    await adminStore.getLocationsWithVenues();
    locationsRef.value = adminStore.locationsWithVenues;
    locationName.value = '';
    locationCentre.value = [];
    state.showLocation = false;
  } catch (error) {
    console.error(error);
  } finally {
    Loading.hide();
  }
};

const removeLocation = async (locationId: number) => {
  Dialog.create({
    title: 'Remove Location',
    message: 'Are you sure you want to remove this location? All associated venues will be removed.',
    ok: {
      label: 'Remove',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancel',
      color: 'primary',
      flat: true
    },
  }).onOk(async () => {
    Loading.show({
      message: 'Removing location',
      spinnerSize: 140,
      spinnerColor: 'primary',
      backgroundColor: 'grey-3'
    });

    try {
      await adminStore.removeLocation(locationId);
      await adminStore.getLocationsWithVenues();
      locationsRef.value = adminStore.locationsWithVenues;
    } catch (error) {
      console.error(error);
    } finally {
      Loading.hide();
    }
  });
};

const addVenue = async (location: Location) => {
  if (!location) {
    Notify.create({
      message: 'No location selected',
      color: 'negative',
      position: 'bottom',
    });
    return;
  }

  if (!venueName.value) {
    Notify.create({
      message: 'Venue name is required',
      color: 'negative',
      position: 'bottom',
    });
    return;
  }

  Loading.show({
    message: 'Adding venue',
    spinnerSize: 140,
    spinnerColor: 'primary',
    backgroundColor: 'grey-3'
  });

  try {
    await adminStore.addVenue(location.id, venueName.value, venueLink.value);
    await adminStore.getLocationsWithVenues();
    locationsRef.value = adminStore.locationsWithVenues;
    venueName.value = '';
    venueLink.value = '';
    state.showVenue = false;
  } catch (error) {
    console.error(error);
  } finally {
    Loading.hide();
  }
};

const removeVenue = async (venue: number) => {
  Dialog.create({
    title: 'Remove Venue',
    message: 'Are you sure you want to remove this venue?',
    ok: {
      label: 'Remove',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancel',
      color: 'primary',
      flat: true
    },
  }).onOk(async () => {
    Loading.show({
      message: 'Removing venue',
      spinnerSize: 140,
      spinnerColor: 'primary',
      backgroundColor: 'grey-3'
    });

    try {
      await adminStore.removeVenue(venue);
      await adminStore.getLocationsWithVenues();
      locationsRef.value = adminStore.locationsWithVenues;
    } catch (error) {
      console.error(error);
    } finally {
      Loading.hide();
    }
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
      position: 'bottom',
      timeout: 2000,
    });
  }
};

const showMap = () => {
  const url = `https://www.google.com/maps?q=${encodeURIComponent(venueName.value)}`;
  window.open(url, '_blank');
}

const showVenue = (gLink: string) => {
  window.open(gLink, '_blank');
}
</script>

<style scoped>
.location-card {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.location-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.q-table th {
  font-weight: 600;
}

.q-table td {
  padding: 8px 16px;
}
</style>
