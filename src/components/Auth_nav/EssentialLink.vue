<template>
  <q-item clickable :to="link" :active="isActive" class="relative-position">
    <q-item-section avatar>
      <q-badge
        v-if="notificationCount > 0"
        color="red"
        :label="notificationCount"
        class="badge"
        rounded
      />
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
  isActiveBlocked?: boolean;
  notificationCount?: number;
}

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
  notificationCount: 0,
});

const route = useRoute();
const isActive = computed(() => route.path === props.link);
</script>

<style scoped lang="scss">
.badge {
  right: -15px;
  top: 10px;
  position: relative;
  z-index: 1;
  margin-top: -18px;
}
</style>
