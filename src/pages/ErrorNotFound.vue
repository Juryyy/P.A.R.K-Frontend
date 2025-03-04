<template>
  <div class="bg-red text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 15vh">404</div>
      <q-btn
        class="q-mt-md"
        size="lg"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />

      <div class="q-mt-md text-h2" style="opacity: 0.4">
        Looks like you have reached a page that doesn't exist. If you think this
        is a mistake, please contact web administrator.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
