<template>
  <q-page class="page-container">
    <div class="q-pa-md content-container">
      <h4 v-if="userResponses.length === 0">No availability yet, wait for Center Exam Manager to create some</h4>
      <q-table v-else
        class="primary-header"
        :rows="userResponses"
        :columns="columns"
        row-key="date"
        :hide-pagination="true"
        :rows-per-page-options="[0]"
        flat
        bordered
        square
      >
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <div class="q-gutter-xs response-layout">
              <div class="response-group compact-width">
                <q-option-group
                  v-model="props.row.response"
                  :options="options.slice(0, 2)"
                  type="radio"
                  inline
                  :disable="props.row.isLocked"
                />
              </div>
              <div class="response-group compact-width">
                <q-option-group
                  v-model="props.row.response"
                  :options="options.slice(2)"
                  type="radio"
                  inline
                  :disable="props.row.isLocked"
                />
              </div>
            </div>
          </q-td>
        </template>
        <template v-slot:bottom>
          <div class="q-pa-sm q-gutter-sm flex flex-row-reverse">
            <q-btn push color="primary" label="Submit" @click="handleSubmit" />
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useAvailabilityStore } from '../../stores/availabilityStore'
import { UserAnswers, UserResponses } from '../../stores/db/types';

const { userResponses }: { userResponses: UserResponses[] } =
  useAvailabilityStore();

const columns: any = [
  {
    name: 'date',
    required: true,
    label: 'Available dates',
    align: 'left',
    field: 'date',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString(),
  },
  { name: 'action', align: 'center', label: 'Response', field: 'response' },
];

const options = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

const handleSubmit = async () => {
  const answers: UserAnswers[] = userResponses.map((day) => ({
    id: day.id,
    response: day.response,
  }));
  await useAvailabilityStore().submitResponses(answers);
};
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  margin: 0 auto; /* Center align */

  /* Quasar provides breakpoints as CSS classes */
  @media (min-width: 600px) {
    max-width: 50%;
  }

  @media (min-width: 1024px) {
    max-width: 40%;
  }

  @media (min-width: 1280px) {
    max-width: 35%;
  }

  @media (min-width: 1440px) {
    max-width: 30%;
  }
}

.response-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.response-group {
  display: flex;
  justify-content: center;
  align-items: center;
}

.compact-width {
  max-width: 100%; /* Adjust the max-width as necessary */
}

.q-table .q-table__body > tr > td {
  vertical-align: middle;
  text-align: center;
}

@media (max-width: 600px) {
  .response-layout {
    flex-direction: column;
    align-items: stretch;
  }
  .compact-width {
    width: 100%;
  }
}
</style>
