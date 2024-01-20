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
          <q-option-group
            v-model="responses[props.row.date]"
            :options="options"
            type="radio"
            inline
          />
        </q-td>
      </template>
      <template v-slot:bottom>
        <div class="submit-btn">
          <div></div>
          <q-btn push color="primary" label="Submit" />
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

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

const columns: any = [
  {
    name: 'date',
    required: true,
    label: 'Available dates',
    align: 'left',
    field: 'date',
    sortable: true
  },
  { name: 'action', align: 'left', label: 'Response', field: 'action' },
];

const rows = days.value.map((day) => {
  return reactive({
    date: day
  });
});

const responses = reactive<Record<string, string>>({});
const options = [
  { label: 'Yes', value: 'Yes' },
  { label: 'Maybe', value: 'Maybe' },
  { label: 'No', value: 'No' },
];
</script>

<style scoped>
.table-container {
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .table-container {
    width: 20%;
    margin: 0 auto;
  }
}

.submit-btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
</style>
