<template>
  <q-page class="page-container">
    <div class="q-pa-md content-container">
      <h4 v-if="userResponses.length === 0" class="text-center text-h5 text-weight-medium q-mb-xl">
        No availability yet. Please wait for the Head of Exams to create some.
      </h4>
      <q-card v-else class="availability-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md absolute-center">Availability Responses</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-table
            class="availability-table"
            :rows="userResponses"
            :columns="columns"
            row-key="date"
            :hide-pagination="true"
            :rows-per-page-options="[0]"
            flat
            bordered
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body-cell-date="props">
              <q-td :props="props" class="text-weight-medium">
                {{ formatDate(props.row.date) }}
              </q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <div class="response-layout q-gutter-y-sm">
                  <q-option-group
                    v-model="props.row.response"
                    :options="options"
                    type="radio"
                    inline
                    :disable="props.row.isLocked"
                    dense
                    class="response-group"
                  >
                    <template v-slot:label="{ label, value }">
                      <q-chip
                        :color="getChipColor(value)"
                        text-color="black"
                        :label="label"
                        size="md"
                        :class="{ 'q-chip--selected': props.row.response === value }"
                      />
                    </template>
                  </q-option-group>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            unelevated
            color="primary"
            label="Submit Responses"
            @click="handleSubmit"
            :loading="submitting"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAvailabilityStore } from '../../stores/availabilityStore'
import { UserAnswers, UserResponses } from 'src/db/types';

const { userResponses }: { userResponses: UserResponses[] } = useAvailabilityStore();
const submitting = ref(false);

const columns: any = [
  {
    name: 'date',
    required: true,
    label: 'Available Dates',
    align: 'left',
    field: 'date',
    sortable: true,
  },
  { name: 'action', align: 'center', label: 'Your Response', field: 'response' },
];

const options = [
  { label: 'YES', value: 'Yes' },
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
  { label: 'NO', value: 'No' },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getChipColor = (value: string) => {
  switch (value) {
    case 'Yes': return 'positive';
    case 'No': return 'negative';
    case 'AM': return 'info';
    case 'PM': return 'warning';
    default: return 'grey';
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const answers: UserAnswers[] = userResponses.map((day) => ({
      id: day.id,
      response: day.response,
    }));
    await useAvailabilityStore().submitResponses(answers);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.content-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.availability-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.availability-table {
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #98c23b;
  }

  thead tr th {
    font-weight: bold;
  }

  tbody td {
    padding-top: 12px;
    padding-bottom: 12px;
  }
}

.response-layout {
  display: flex;
  justify-content: center;
  align-items: center;
}

.response-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.q-chip {
  transition: all 0.3s ease;
  font-size: 14px; // Increased font size
  font-weight: 500; // Medium font weight for better readability

  &--selected {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 600px) {
  .page-container {
    padding: 1rem 0.5rem;
  }

  .response-layout {
    flex-direction: column;
  }

  .response-group {
    width: 100%;
  }
}
</style>
