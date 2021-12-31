<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider
      :closable="true"
      :keep-alive-on-hover="true"
      :duration="5000"
    >
      <main-page />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  useOsTheme,
  darkTheme,
} from 'naive-ui';

import MainPage from './MainPage.vue';

const theme = computed(() => (useOsTheme().value === 'dark' ? darkTheme : null));
</script>
