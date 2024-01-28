<template>
  <q-page>
  <div class="table-container q-my-md">
    <q-table class="primary-header"
      :rows="userResponses"
      :columns="columns"
      row-key="date"
      :hide-pagination="true"
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-option-group
            v-model="props.row.response"
            :options="options"
            type="radio"
            inline
          />
        </q-td>
      </template>
      <template v-slot:bottom>
        <div class="submit-btn">
          <div></div>
          <q-btn push color="primary" label="Submit" @click="handleSubmit" />
        </div>
      </template>
    </q-table>
  </div>
</q-page>
</template>

<script setup lang="ts">
import { useAvailabilityStore } from 'src/stores/availabilityStore';
import {UserAnswers, UserResponses} from 'src/stores/db/types';

const { userResponses }: { userResponses: UserResponses[] } = useAvailabilityStore();

const columns: any = [
  {
    name: 'date',
    required: true,
    label: 'Available dates',
    align: 'left',
    field: 'date',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString()
  },
  { name: 'action', align: 'left', label: 'Response', field: 'response' },
];

const options = [
  { label: 'Yes', value: 'Yes' },
  { label: 'Maybe', value: 'Maybe' },
  { label: 'No', value: 'No' },
];

const handleSubmit = async () => {
  const answers: UserAnswers[] = userResponses.map(day => ({ id: day.id, response: day.response }));
  await useAvailabilityStore().submitResponses(answers);
};

</script>

<style scoped>
.table-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.table-container table {
  width: 100%;
}

.submit-btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
</style>
