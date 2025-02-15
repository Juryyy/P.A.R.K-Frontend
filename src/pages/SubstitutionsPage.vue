<template>
  <q-page class="row justify-evenly">
    <template v-if="state.isLoaded">
      <SubstitutionList />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import SubstitutionList from 'components/Exams/SubstitutionList.vue'
import { onMounted, reactive } from 'vue'
import { useSubstitutionStore } from 'stores/substitutionStore'
import { Loading } from 'quasar'

const substitutionStore = useSubstitutionStore()

const state = reactive({
  isLoaded: false,
})

onMounted(async () => {
  state.isLoaded = false
  Loading.show({
    message: 'Loading substitutions...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  })
  await substitutionStore.loadSubstitutions()
  await substitutionStore.loadMyApplications()
  Loading.hide()
  state.isLoaded = true
})
</script>
