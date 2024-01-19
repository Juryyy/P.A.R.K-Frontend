<template>
<div>
  <CheckList/>
</div>
</template>

<script setup lang="ts">
import CheckList from 'src/components/CheckList.vue';
import {useCandidateStore} from 'src/stores/candidateStore';

const candidateStore = useCandidateStore();

console.log('Checklist:', candidateStore.candidates);

</script>
