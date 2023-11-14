<template>
  <div class="row items-center justify-evenly">
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Available</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in days" :key="day">
          <td>{{ day }}</td>
          <td><input type="checkbox"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const days = ref<string[]>([]);
const today = new Date();
for (let i = 0; i < 14; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() + i);
  days.value.push(date.toLocaleDateString());
}
</script>
