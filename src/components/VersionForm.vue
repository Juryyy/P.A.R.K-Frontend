<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Version Notes</div>
      </q-card-section>

      <q-card-section>
        <q-list bordered>
          <q-item v-for="note in sortedVersionNotes" :key="note.version">
            <q-item-section>
              <q-item-label>
                <strong>Version {{ note.version }} - {{ note.date }}</strong>
              </q-item-label>
              <q-item-label caption>
                <ul>
                  <li v-for="update in note.updates" :key="update">{{ update }}</li>
                </ul>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface VersionNote {
  version: string;
  updates: string[];
  date?: string;
}

const versionNotes = ref<VersionNote[]>([
  {
    version: '0.1.0',
    date: '14.10.2024',
    updates: [
      'Initial testing',
    ]
  },
  {
    version: '0.1.1',
    date: '15.10.2024',
    updates: [
      'Fixed texts',
      'Added paging to users table'
    ]
  },
  {
    version: '0.1.2',
    date: '16.10.2024',
    updates: [
      'Implemented users avatar',
      'Posts now contain authors avatar',
      'Posts now has updated graphics',
      'Updated right drawer exams to contain users confirmation status',
      'Fixed problems with viewing some data on users profile'
    ]
  },
  {
    version: '0.1.3',
    date: '17.10.2024',
    updates: [
      'Posts now contain search bar',
      'Updated posts edit mode to filter out users/roles when typing',
      'Users tables has been slighly updated',
      'Create availability now has updated graphics'
      ]
  },
  {
    version: '0.1.4',
    date: '22.10.2024',
    updates: [
      'Fixed issues with updating profile (thanks David)',
      'Updated labels on profile to be always on top and smaller',
      'Fixed issue with viewing exam without having role office',
      'Fixed issue with allowing changes of availability after day lock',
      'In edit exam declined has been renamed to Unavailable',
  ]
  }
]);

const sortedVersionNotes = computed(() => {
  return [...versionNotes.value].sort((a, b) => {
    const versionA = a.version.split('.').map(Number);
    const versionB = b.version.split('.').map(Number);
    for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
      const numA = versionA[i] || 0;
      const numB = versionB[i] || 0;
      if (numA !== numB) {
        return numB - numA; // Descending order
      }
    }
    return 0;
  });
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
