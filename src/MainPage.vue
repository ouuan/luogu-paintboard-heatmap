<template>
  <n-space
    id="main"
    vertical
  >
    <n-page-header title="洛谷冬日绘板热力图" />

    <n-card title="计数">
      <n-form-item label="x1">
        <n-input-number
          v-model:value="x1"
          :min="0"
          :max="WIDTH-1"
        />
      </n-form-item>
      <n-form-item label="y1">
        <n-input-number
          v-model:value="y1"
          :min="0"
          :max="HEIGHT-1"
        />
      </n-form-item>
      <n-form-item label="x2">
        <n-input-number
          v-model:value="x2"
          :min="0"
          :max="WIDTH-1"
        />
      </n-form-item>
      <n-form-item label="y2">
        <n-input-number
          v-model:value="y2"
          :min="0"
          :max="HEIGHT-1"
        />
      </n-form-item>
      <n-p>
        token 计数：{{ sum.toFixed(2) }}
      </n-p>
    </n-card>

    <n-card title="热力图">
      <n-space justify="space-around">
        <canvas
          ref="canvas"
          :width="WIDTH"
          :height="HEIGHT"
          :style="canvasStyle"
          @click="handleCanvasClick"
        />
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import {
  NCard,
  NFormItem,
  NInputNumber,
  NP,
  NPageHeader,
  NSpace,
} from 'naive-ui';
import { ref, watch } from 'vue';
import connectWs from './connectWs';
import {
  CD,
  HEIGHT,
  INTERVAL,
  palette,
  WIDTH,
} from './constants';

const canvas = ref<null|HTMLCanvasElement>(null);

const cnt = Array.from(Array(WIDTH), () => Array<number>(HEIGHT).fill(0));
const color = Array.from(Array(WIDTH), () => Array<number>(HEIGHT).fill(2));

function paint(x: number, y: number, col: number) {
  cnt[x][y] += 1;
  color[x][y] = col;
  setTimeout(() => {
    cnt[x][y] -= 1;
  }, INTERVAL);
}

connectWs(paint);

const startTime = new Date().valueOf();

const sum = ref(0);
const x1 = ref(0);
const x2 = ref(WIDTH - 1);
const y1 = ref(0);
const y2 = ref(HEIGHT - 1);

function update() {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  const imageData = ctx.createImageData(WIDTH, HEIGHT);

  const max = Math.max(1, cnt.reduce((prev, cur) => Math.max(
    prev,
    cur.reduce((p, c) => Math.max(p, Math.log(c ? c + 4 : 2)), 0),
  ), 0));

  for (let x = 0; x < WIDTH; x += 1) {
    for (let y = 0; y < HEIGHT; y += 1) {
      const index = (x + y * WIDTH) * 4;
      for (let i = 0; i < 3; i += 1) {
        imageData.data[index + i] = palette[color[x][y]][i]
          * (Math.log(cnt[x][y] ? cnt[x][y] + 4 : 2) / max);
      }
      imageData.data[index + 3] = 255;
    }
  }

  sum.value = 0;
  for (let x = Math.min(x1.value, x2.value); x <= Math.max(x1.value, x2.value); x += 1) {
    for (let y = Math.min(y1.value, y2.value); y <= Math.max(y1.value, y2.value); y += 1) {
      sum.value += cnt[x][y];
    }
  }
  sum.value *= CD / Math.min(new Date().valueOf() - startTime, INTERVAL);

  ctx.putImageData(imageData, 0, 0);
}

setInterval(update, 1000);

const canvasBorderWidth = 2;
const canvasStyle = {
  borderStyle: 'solid',
  borderColor: 'grey',
  borderWidth: `${canvasBorderWidth}px`,
};

const clickChangesOne = ref(true);

function handleCanvasClick(e: MouseEvent) {
  const cv = canvas.value;
  if (!cv) return;
  const rect = cv.getBoundingClientRect();
  const newX = Math.floor(e.clientX - rect.left - canvasBorderWidth);
  const newY = Math.floor(e.clientY - rect.top - canvasBorderWidth);
  if (clickChangesOne.value) {
    x1.value = newX;
    y1.value = newY;
  } else {
    x2.value = newX;
    y2.value = newY;
  }
  clickChangesOne.value = !clickChangesOne.value;
}

function clamp(val: number, limit: number) {
  if (!Number.isFinite(val)) return 0;
  if (val < 0) return 0;
  if (val >= limit) return limit - 1;
  return Math.floor(val);
}

watch(x1, (val) => {
  x1.value = clamp(val, WIDTH);
});
watch(x2, (val) => {
  x2.value = clamp(val, WIDTH);
});
watch(y1, (val) => {
  y1.value = clamp(val, HEIGHT);
});
watch(y2, (val) => {
  y2.value = clamp(val, HEIGHT);
});

watch([x1, y1, x2, y2], () => update());
</script>

<style scoped>
#main {
  max-width: 80%;
  margin: auto;
  margin-top: 20px;
}
</style>
