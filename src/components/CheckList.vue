<template>
  <div class="table-container">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="date"
      :hide-pagination="true"
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-checkbox v-model="props.row.checked" />
        </q-td>
      </template>
    </q-table>
    <q-btn push color="primary" label="Submit">
    </q-btn>
  </div>
</template>


<script setup lang="ts">
import { ref, reactive} from 'vue';

const days = ref<string[]>([]);
const today = new Date();
for (let i = 0; i < 100; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() + i);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    days.value.push(date.toLocaleDateString());
  }
}
const columns : any = [
    {
    name: 'date',
    required: true,
    label: 'Available dates',
    align: 'left',
    field: 'date',
    sortable: true
  },
  { name: 'action', align: 'left', label: 'Action', field: 'action' }
];

const rows = days.value.map((day) => {
  return reactive({
    date: day,
    checked: false
  });
});
</script>

<style scoped>
.table-container {
  width: 50%;
  margin: 0 auto;
}
</style>
