<template>
  <div>
    <button @click="addRow">Add Row</button>
    <button @click="addBreak">Add Break</button>
    <draggable v-model="schedule" group="schedule" @end="onDragEnd">
      <table>
        <thead>
          <tr>
            <th>Interval</th>
            <th>Level</th>
            <th>Start</th>
            <th>Finish</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Global</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in schedule" :key="index">
            <td>{{ item.interval }}</td>
            <td>{{ item.level }}</td>
            <td>{{ item.start }}</td>
            <td>{{ item.finish }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.surname }}</td>
            <td>{{ item.global }}</td>
            <td>{{ item.comment }}</td>
          </tr>
        </tbody>
      </table>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';

interface ScheduleItem {
  interval: number;
  level: string;
  start: string;
  finish: string;
  name: string;
  surname: string;
  global: string;
  comment: string;
}

const schedule = ref<ScheduleItem[]>([
  // Initial data can be populated here
]);

const addRow = () => {
  const lastItem = schedule.value[schedule.value.length - 1];
  const newStart = incrementTime(lastItem ? lastItem.finish : '11:00');
  const newFinish = incrementTime(newStart, 14);

  schedule.value.push({
    interval: 14,
    level: 'PET4S',
    start: newStart,
    finish: newFinish,
    name: '',
    surname: '',
    global: '',
    comment: '',
  });
};

const addBreak = () => {
  schedule.value.push({
    interval: 10,
    level: 'Break',
    start: '',
    finish: '',
    name: '',
    surname: '',
    global: '',
    comment: '',
  });
};

const incrementTime = (time: string, minutesToAdd = 14): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const newMinutes = minutes + minutesToAdd;
  const newHours = hours + Math.floor(newMinutes / 60);
  const finalMinutes = newMinutes % 60;

  return `${newHours.toString().padStart(2, '0')}:${finalMinutes
    .toString()
    .padStart(2, '0')}`;
};

const onDragEnd = (event: any) => {
  console.log('Drag ended:', event);
};
</script>

<style>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
}

.break {
  background-color: #b0c4de;
}

.draggable-item {
  cursor: move;
}
</style>
