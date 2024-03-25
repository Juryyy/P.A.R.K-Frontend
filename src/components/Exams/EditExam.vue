<template>
    <q-card
          bordered
          class="q-ma-md"
        >
          <q-card-section>
            <div class="text-h5">{{ exam.location }}</div>
            <div class="text-h6">Venue: {{ exam.venue }} </div>
            <div>Type: {{ exam.type }}</div>
            <div>Levels: {{ exam.levels.join(', ') }}</div>
            <div>Start time: {{ exam.startTime }}</div>
            <div>End time: {{ exam.endTime }}</div>
            <div>
              Note:
              <span>
                {{ exam.note }}
              </span>
            </div>
            <q-separator />
            <div>
              Supervisors:
              <div v-if="exam.supervisors.length === 0">
                No supervisors assigned
              </div>

              <div
                v-else
                v-for="supervisor in exam.supervisors"
                :key="supervisor.id"
              >
                {{ supervisor.firstName }} {{ supervisor.lastName }}
              </div>
            </div>

            <div>
              Invigilators:
              <div v-if="exam.invigilators.length === 0">
                No invigilators assigned
              </div>

              <div
                v-else
                v-for="invigilator in exam.invigilators"
                :key="invigilator.id"
              >
                {{ invigilator.firstName }} {{ invigilator.lastName }}
              </div>
            </div>

            <div>
              Examiners:
              <div v-for="examiner in exam.examiners" :key="examiner.id">
                {{ examiner.firstName }} {{ examiner.lastName }}
              </div>
            </div>
          </q-card-section>
  </q-card>

  <q-card
    bordered
    class="q-ma-md"
  >
  <div v-for="response in responses" :key="response.id">
    <q-card-section>
      <div class="text-h6">Response for {{ response.userName}}</div>
      <div>Response: {{ response.response }}</div>
      <div>Role: {{ response.userRole }}</div>
    </q-card-section>
  </div>
  </q-card>
</template>

<script setup lang="ts">
import { dayResponse, Exam } from 'src/stores/db/types';
import { ref } from 'vue';

const props = defineProps<{
  exam: Exam;
  responses: dayResponse[];
}>();

</script>
