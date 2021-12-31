<template>
  <n-space
    id="main"
    vertical
  >
    <n-page-header title="洛谷冬日绘板热力图" />

    <n-card
      title="热力图"
    >
      <n-space justify="space-around">
        <canvas
          ref="canvas"
          width="1000"
          height="600"
        />
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import {
  NCard,
  NPageHeader,
  NSpace,
} from 'naive-ui';
import { ref } from 'vue';
import connectWs from './connectWs';
import { HEIGHT, INTERVAL, WIDTH } from './constants';

const canvas = ref<null|HTMLCanvasElement>(null);

const cnt = Array.from(Array(WIDTH), () => Array<number>(HEIGHT).fill(0));

function paint(x: number, y: number) {
  cnt[x][y] += 1;
  console.log(x, y);
  setTimeout(() => {
    cnt[x][y] -= 1;
  }, INTERVAL);
}

connectWs(paint);

function updateCanvas() {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  const imageData = ctx.createImageData(WIDTH, HEIGHT);

  const max = Math.max(1, cnt.reduce((prev, cur) => Math.max(
    prev,
    cur.reduce((p, c) => Math.max(p, c), 0),
  ), 0));

  for (let x = 0; x < WIDTH; x += 1) {
    for (let y = 0; y < HEIGHT; y += 1) {
      const index = (x + y * WIDTH) * 4;
      for (let i = 0; i < 3; i += 1) imageData.data[index + i] = 255 * (cnt[x][y] / max);
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

setInterval(updateCanvas, 5000);
</script>

<style scoped>
#main {
  max-width: 80%;
  margin: auto;
  margin-top: 20px;
}

canvas {
  border: 2px solid grey;
}
</style>
