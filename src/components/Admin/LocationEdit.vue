<template>
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Edit Location</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="localLocation.name"
          label="Location Name"
          autofocus
          :rules="[val => !!val || 'Location name is required']"
        />
        <q-select
          v-model="localLocation.adminCentre"
          :options="Object.values(CentreEnum)"
          label="Admin Centre"
          class="q-mt-sm"
          clearable
          multiple
          :rules="[val => val?.length > 0 || 'At least one admin centre is required']"
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="closeDialog" />
        <q-btn unelevated label="Save Changes" @click="updateLocation" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { Location, CentreEnum } from 'src/db/types';
import { useAdminStore } from 'src/stores/adminStore';
import { Loading, Notify } from 'quasar';

const adminStore = useAdminStore();

const props = defineProps<{
  location: Location;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'location-updated', location: Location): void;
}>();

const showDialog = ref(props.show);
const localLocation = ref<Location>({ ...props.location });

watch(() => props.show, (newValue) => {
  showDialog.value = newValue;
});

watch(showDialog, (newValue) => {
  emit('update:show', newValue);
});

watch(() => props.location, (newValue) => {
  localLocation.value = { ...newValue };
}, { deep: true });

const updateLocation = async () => {
  if (!localLocation.value.name || !localLocation.value.adminCentre?.length) {
    return;
  }

  Loading.show({
    message: 'Updating location...',
    spinnerColor: 'primary',
    backgroundColor: 'grey-3'
  });

  await adminStore.updateLocation(
    localLocation.value.id,
    localLocation.value.name,
    localLocation.value.adminCentre
  );

  Loading.hide();
};

const closeDialog = () => {
  emit('update:show', false);
};
</script>
