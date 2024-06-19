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
  <q-card-section>
  <div class="text-h4">Supervisors</div>
  <q-separator class="q-my-sm"/>
  <div v-for="response in responses" :key="response.id">
    <div v-if="response.response !== 'No' && (response.userRole === 'Supervisor' || response.userRole === 'SeniorSupervisor' || response.userRole === 'Office')">
      <div class="text-h6 text-weight-bold">{{ response.userName}}
      <q-btn @click="addToExam(response.id)" icon="add" color="primary" round size="md"/>
      </div>
    </div>
  </div>
  </q-card-section>
  </q-card>

  <q-card
  bordered
  class="q-ma-md"
>
<q-card-section>
  <div class="text-h4">Invigilators</div>
  <q-separator class="q-my-sm"/>
  <div v-for="response in responses" :key="response.id">
    <div v-if="response.response === 'No' && (response.userRole === 'Supervisor' || response.userRole === 'SeniorSupervisor' || response.userRole === 'Office')">
      <div class="text-h6">{{ response.userName}}</div>
      <div>Response: {{ response.userRole }}</div>
      <q-separator/>
    </div>
  </div>
</q-card-section>
</q-card>

</template>

<script setup lang="ts">
import { dayResponse, Exam } from 'src/stores/db/types';
import { ref } from 'vue';

const props = defineProps<{
  exam: Exam;
  responses: dayResponse[];
}>();

console.log(props.responses)

const addToExam = (id: number) => {
  console.log(id)
}

</script>
