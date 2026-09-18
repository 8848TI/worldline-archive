<template>
  <div class="glass-card">
    <h3 class="card-title-sm">🌤 天气</h3>
    <!-- 当前天气（mock 数据，见 config/site.js；接真实 API 时替换此处） -->
    <div class="weather-now">
      <span class="weather-icon">{{ site.weather.icon }}</span>
      <div class="weather-main">
        <span class="weather-temp">{{ site.weather.temp }}</span>
        <span class="weather-city">{{ site.weather.city }} · {{ site.weather.weather }}</span>
      </div>
    </div>
    <div class="weather-forecast">
      <div v-for="f in site.weather.forecast" :key="f.day" class="forecast-item">
        <span class="f-day">{{ f.day }}</span>
        <span class="f-icon">{{ f.icon }}</span>
        <span class="f-temp">{{ f.temp }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { site } from '@/config/site'
</script>

<style scoped>
.weather-now {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.weather-icon {
  font-size: 34px;
}

.weather-main {
  display: flex;
  flex-direction: column;
}

.weather-temp {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.weather-city {
  font-size: var(--fs-xs);
  color: var(--text-2);
}

.weather-forecast {
  display: flex;
  gap: 8px;
}

.forecast-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
}

.f-day {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.f-icon {
  font-size: 16px;
}

.f-temp {
  font-size: var(--fs-xs);
  color: var(--text-2);
}
</style>
