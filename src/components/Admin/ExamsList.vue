<template>
  <div class="exam-schedule q-pa-md">
    <h2 class="text-h4 q-mb-md">View Exams</h2>
    <div v-for="(monthDays, monthYear) in groupedDays" :key="monthYear">
      <div class="text-h5 q-my-md">
        {{ formatMonthYear(String(monthYear)) }}
      </div>
      <q-separator v-if="isNewYear(String(monthYear))" class="q-my-lg" />
      <q-list class="rounded-borders">
        <div
          v-for="day in monthDays"
          :key="day.id"
          class="custom-expansion-item q-mb-md"
        >
          <q-expansion-item
            expand-separator
            :default-opened="false"
            @show="() => toggleDay(day.id as number, true)"
            @hide="() => toggleDay(day.id as number, false)"
            :disable="day.examsCount === 0"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ day.examsCount }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{
                  formatDate(day.date)
                }}</q-item-label>
                <q-item-label caption>
                  <span
                    :class="
                      day.isForInvigilators ? 'text-positive' : 'text-negative'
                    "
                    >Invigilators:
                    {{ day.isForInvigilators ? 'Yes' : 'No' }}</span
                  >
                  |
                  <span
                    :class="
                      day.isForExaminers ? 'text-positive' : 'text-negative'
                    "
                    >Examiners: {{ day.isForExaminers ? 'Yes' : 'No' }}</span
                  >
                  |
                  <span
                    :class="day.isLocked ? 'text-negative' : 'text-positive'"
                    >Locked: {{ day.isLocked ? 'Yes' : 'No' }}</span
                  >
                </q-item-label>
              </q-item-section>
            </template>

            <q-card v-if="expandedDays.has(day.id as number)">
              <q-card-section>
                <q-list dense>
                  <q-item
                    v-for="exam in examsForDay(day.id as number)"
                    :key="exam.id"
                    clickable
                    v-ripple
                    :to="`/exam/${exam.id}`"
                    class="q-my-sm"
                  >
                    <q-item-section avatar>
                      <q-icon name="event" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label
                        >{{ exam.type }} - {{ exam.venue }}</q-item-label
                      >
                      <q-item-label caption
                        >{{ formatTimeString(exam.startTime) }} -
                        {{ formatTimeString(exam.endTime) }}</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="primary" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { CentreEnum, DayOfExamsC, Exam } from 'src/db/types';
import { formatTimeString } from 'src/helpers/FormatTime';
import { groupBy } from 'lodash';
import { useExamDay } from 'src/composables/useExamDay';
import { useExam } from 'src/composables/useExam';

const daysOfExams = ref<DayOfExamsC[]>([]);
const expandedDays = ref<Set<number>>(new Set());

const props = defineProps<{
  centre: CentreEnum;
}>();

const fetchDaysOfExams = async () => {
  daysOfExams.value = (await useExamDay().loadAllExamDays(props.centre)) || [];
};

const fetchExamsForDay = async (dayId: number) => {
  await useExam().getExamsForDay(dayId);
};

const examsForDay = (dayId: number): Exam[] => {
  return useExam().pastExams.filter((exam) => exam.dayOfExamsId === dayId);
};

const toggleDay = async (dayId: number, isExpanded: boolean) => {
  if (isExpanded) {
    expandedDays.value.add(dayId);
    if (!examsForDay(dayId).length) {
      await fetchExamsForDay(dayId);
    }
  } else {
    expandedDays.value.delete(dayId);
  }
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const groupedDays = computed(() => groupDaysByMonthAndYear(daysOfExams.value));

const isNewYear = (monthYear: string) => {
  const [month] = monthYear.split('-');
  return month === '0';
};

const groupDaysByMonthAndYear = (days: DayOfExamsC[]) => {
  const sortedDays = [...days].sort(
    (b, a) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return groupBy(sortedDays, (day: any) => {
    const date = new Date(day.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  });
};

const formatMonthYear = (dateString: string) => {
  const [year, month] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

onMounted(fetchDaysOfExams);
</script>

<style lang="scss" scoped>
.exam-schedule {
  max-width: 800px;
  margin: 0 auto;
}

.custom-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: $bg-light;
}

.custom-expansion-item .q-expansion-item__container {
  background-color: $bg-light;
}

.custom-expansion-item .q-expansion-item__content {
  background-color: $bg-light;
}

.q-card {
  background-color: $bg-light;
}

.q-item__label--caption {
  font-size: 0.85rem;
}

.text-positive {
  color: #21ba45;
}

.text-negative {
  color: #c10015;
}

.exam-count-avatar {
  font-size: 1.2rem;
  font-weight: bold;
}

.year-separator {
  height: 2px;
  background-color: $primary;
  margin: 2rem 0;
}
</style>
