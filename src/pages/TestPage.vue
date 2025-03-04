<template>
  <div>
    <div>
      <input v-model="startTime" type="time" placeholder="Enter start time" />
      <input v-model="levelName" type="text" placeholder="Enter level name" />
      <input
        v-model.number="numberOfRows"
        type="number"
        placeholder="Enter number of rows"
      />
      <button @click="generateRows">Generate Rows</button>
      <button @click="prepareData">Upload Data</button>
    </div>
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
          <th>Action</th>
          <!-- Added column for remove button -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, rowIndex) in schedule" :key="rowIndex">
          <td>{{ item.interval }}</td>
          <td>{{ item.level }}</td>
          <td>{{ item.start }}</td>
          <td>{{ item.finish }}</td>
          <td>
            <draggable v-model="item.name" group="schedule" @end="onDragEnd">
              <template #item="{ element }">
                <div>{{ element }}</div>
              </template>
            </draggable>
          </td>
          <td>
            <draggable v-model="item.surname" group="schedule" @end="onDragEnd">
              <template #item="{ element }">
                <div>{{ element }}</div>
              </template>
            </draggable>
          </td>
          <td>{{ item.global }}</td>
          <td>{{ item.comment }}</td>
          <td>
            <button @click="removeRow(rowIndex)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';

interface ScheduleItem {
  id: number;
  interval: number;
  level: string;
  start: string;
  finish: string;
  name: string[];
  surname: string[];
  global: string;
  comment: string;
}

const startTime = ref<string>('11:00');
const levelName = ref<string>('PET4S');
const numberOfRows = ref<number>(0);
const schedule = ref<ScheduleItem[]>([]);

const generateRows = () => {
  const newSchedule: ScheduleItem[] = [];
  let currentStartTime = startTime.value;

  for (let i = 0; i < numberOfRows.value; i++) {
    const newStart = incrementTime(currentStartTime);
    const newFinish = incrementTime(newStart, 14);
    currentStartTime = newFinish;

    newSchedule.push({
      id: i + 1, // Assigning a unique ID (assuming IDs start from 1)
      interval: 14,
      level: levelName.value,
      start: newStart,
      finish: newFinish,
      name: [],
      surname: [],
      global: '',
      comment: '',
    });
  }

  schedule.value = newSchedule;
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

const prepareData = () => {
  console.log('Prepared Data:', schedule.value);
  // Here you can add the logic to upload or process the data as needed
};

const removeRow = (index: number) => {
  schedule.value.splice(index, 1);
  // Adjust start times for remaining rows
  if (schedule.value.length > 0) {
    let currentStartTime = schedule.value[0].start;
    for (let i = 1; i < schedule.value.length; i++) {
      const newStart = incrementTime(currentStartTime);
      const newFinish = incrementTime(newStart, 14);
      currentStartTime = newFinish;

      schedule.value[i].start = newStart;
      schedule.value[i].finish = newFinish;
    }
  }
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

td {
  padding: 5px;
}

div {
  padding: 5px;
}
</style>
