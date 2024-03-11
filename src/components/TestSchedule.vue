<template>
  <div>
    <button @click="addRow">Add Row</button>
    <button @click="addBreak">Add Break</button>
    <draggable v-model="schedule" :options="{ handle: '.handle' }">
      <template #item="{ element }">
        <div>
          <input v-model="element.startTime" type="text" placeholder="Start Time">
          <input v-model="element.finishTime" type="text" placeholder="Finish Time">
          <div class="handle">Drag</div>
          <div v-for="(user, userIndex) in users" :key="userIndex">
            <input v-model="element['user'+(userIndex+1)]" type="text" :placeholder="'User ' + (userIndex+1)">
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';

interface ScheduleItem {
  startTime: string;
  finishTime: string;
  [key: string]: string; // Index signature to allow any string key for users
}

const schedule = ref<ScheduleItem[]>([
  { startTime: '', finishTime: '', user1: '', user2: '' },
  // Add more initial rows here if needed
]);

const users = ref([
  'Karel', 'Filip', 'Petr', 'Pavel', 'Karolina', 'Jiri', 'Jirka', 'Martin'
]);

const addRow = () => {
  schedule.value.push({ startTime: '', finishTime: '', user1: '', user2: '' });
};

const addBreak = () => {
  schedule.value.push({ startTime: '--- break ---', finishTime: '', user1: '', user2: '' });
};

const serializeSchedule = () => {
  return JSON.stringify(schedule.value);
};
</script>

<style scoped>
.handle {
  cursor: move;
  background-color: lightgray;
  padding: 5px;
  margin-bottom: 5px;
}
</style>
