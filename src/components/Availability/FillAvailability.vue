<template>
  <div class="q-pa-md content-container">
    <h4 v-if="!hasResponses" class="text-center text-h5 text-weight-medium q-mb-xl">
      No availability yet. Please wait for the Head of Exams to create some.
    </h4>
    <q-card v-else class="availability-card">
      <q-card-section>
        <div class="text-h6 text-weight-bold q-mb-md text-center">
          {{ props.centre }} Availability Responses
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          class="availability-table"
          :rows="centreResponses"
          :columns="columns"
          row-key="date"
          :hide-pagination="true"
          :rows-per-page-options="[0]"
          flat
          bordered
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr
              :props="props"
              :class="{ 'new-response': !props.row.hasSeen }"
              @mounted="handleResponseSeen(props.row.id)"
            >
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'date'">
                  <div class="row items-center">
                    {{ formatDate(props.row.date) }}
                    <q-badge
                      v-if="!props.row.hasSeen"
                      color="red"
                      text-color="white"
                      label="New"
                      class="q-ml-sm"
                    />
                  </div>
                </template>

                <template v-else-if="col.name === 'action'">
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
                </template>
              </q-td>
            </q-tr>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAvailabilityStore } from '../../stores/availabilityStore';
import { storeToRefs } from 'pinia';
import { UserResponses, UserAnswers } from 'src/db/types';

const props = defineProps<{
  centre: string;
}>();

const availabilityStore = useAvailabilityStore();
const { userResponses } = storeToRefs(availabilityStore);

const submitting = ref(false);

const centreResponses = computed<UserResponses[]>(() => {
  return (userResponses.value as UserResponses[]).filter(response => response.centre === props.centre);
});

const hasResponses = computed(() => centreResponses.value.length > 0);

const columns = [
  {
    name: 'date',
    required: true,
    label: 'Available Dates',
    align: 'left' as const,
    field: 'date',
    sortable: true,
  },
  {
    name: 'action',
    align: 'center' as const,
    label: 'Your Response',
    field: 'response'
  },
];

const options: { label: string; value: string }[] = [
  { label: 'YES', value: 'Yes' },
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
  { label: 'NO', value: 'No' },
] as const;

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

const handleResponseSeen = async (responseId: number) => {
  await availabilityStore.loadResponsesForUser();
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const answers: UserAnswers[] = centreResponses.value.map((day) => ({
      id: day.id,
      response: day.response,
      centre: day.centre,
    }));
    await availabilityStore.submitResponses(answers);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
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
}

.new-response {
  background-color: #e9f5d2;
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

  &--selected {
    transform: scale(1.05);
  }
}

@media (max-width: 600px) {
  .response-layout {
    flex-direction: column;
  }

  .response-group {
    width: 100%;
  }
}
</style>
