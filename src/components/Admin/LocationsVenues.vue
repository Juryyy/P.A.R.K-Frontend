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
import { Location } from 'src/db/types';
import { Dialog } from 'quasar';
import { CentreEnum } from 'src/db/types';
import { useAdmin } from 'src/composables/useAdmin';
import { NotificationService } from 'src/utils/services/notificationService';

const locations: Location[] = useAdmin().locationsWithVenues.value;
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
});

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
    NotificationService.error('Location name is required');
    return;
  }

  if(!locationCentre.value) {
    NotificationService.error('Admin centre is required');
    return;
  }

  await useAdmin().addLocation(locationName.value, locationCentre.value);
  await useAdmin().getLocationsWithVenues();
  locationsRef.value = useAdmin().locationsWithVenues.value;
  locationName.value = '';
  locationCentre.value = [];
  state.showLocation = false;
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
      await useAdmin().removeLocation(locationId);
      await useAdmin().getLocationsWithVenues();
      locationsRef.value = useAdmin().locationsWithVenues.value;
  });
};

const addVenue = async (location: Location) => {
  if (!location) {
    NotificationService.error('Location not found');
    return;
  }

  if (!venueName.value) {
    NotificationService.error('Venue name is required');
    return;
  }

  await useAdmin().addVenue(location.id, venueName.value, venueLink.value);
  await useAdmin().getLocationsWithVenues();
  locationsRef.value = useAdmin().locationsWithVenues.value;
  venueName.value = '';
  venueLink.value = '';
  state.showVenue = false;
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
  await useAdmin().removeVenue(venue);
  await useAdmin().getLocationsWithVenues();
  locationsRef.value = useAdmin().locationsWithVenues.value;
  });
};

const showVenueDialog = (locationId: number) => {
  const location = locationsRef.value.find(loc => loc.id === locationId);
  if (!location) {
    NotificationService.error('Location not found');
    return
  }

  selectedLocation.value = location;
  state.showVenue = true;
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
