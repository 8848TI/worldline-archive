<template>
  <div class="glass-card">
    <div class="cal-head">
      <h3 class="card-title-sm cal-title">📅 日历</h3>
      <div class="cal-nav">
        <button class="cal-btn" @click="prev">‹</button>
        <span class="cal-month">{{ year }}年{{ month + 1 }}月</span>
        <button class="cal-btn" @click="next">›</button>
      </div>
    </div>

    <div class="cal-weekdays">
      <span v-for="w in weekdays" :key="w">{{ w }}</span>
    </div>
    <div class="cal-days">
      <span
        v-for="(d, i) in days"
        :key="i"
        class="cal-day"
        :class="{ today: isToday(d), empty: d === null }"
      >{{ d ?? '' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth()) // 0-based
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 当前月份的天数网格（首格前用 null 补齐星期偏移）
const days = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
})

function isToday(d) {
  return d !== null && d === today.getDate() && year.value === today.getFullYear() && month.value === today.getMonth()
}

function prev() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
}

function next() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
}
</script>

<style scoped>
.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cal-title {
  margin-bottom: 0;
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cal-month {
  font-size: var(--fs-xs);
  color: var(--text-2);
}

.cal-btn {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--text-2);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.cal-btn:hover {
  background: var(--primary);
  color: #fff;
}

.cal-weekdays,
.cal-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-weekdays span {
  text-align: center;
  font-size: var(--fs-xs);
  color: var(--text-3);
  padding: 4px 0;
}

.cal-day {
  text-align: center;
  font-size: var(--fs-xs);
  color: var(--text-2);
  padding: 5px 0;
  border-radius: 6px;
}

.cal-day.today {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}
</style>
