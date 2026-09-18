<template>
  <div class="glass-card intro">
    <div class="intro-avatar">
      <img v-if="site.intro.avatar" :src="site.intro.avatar" alt="头像" />
      <span v-else class="avatar-fallback">✦</span>
    </div>
    <div class="intro-name">{{ site.intro.name }}</div>
    <p class="intro-bio">{{ site.intro.bio }}</p>
    <div class="intro-links">
      <a
        v-for="l in site.intro.links"
        :key="l.label"
        class="link-icon"
        :href="l.url"
        target="_blank"
        rel="noopener"
        :title="l.label"
        :aria-label="l.label"
      >
        <svg v-if="isGithub(l)" class="svg-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 0 0 8.2 11.39c.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0z"/>
        </svg>
        <svg v-else-if="isMail(l)" class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2"/>
          <path d="m3 7 9 6 9-6"/>
        </svg>
        <svg v-else class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { site } from '@/config/site'

function isGithub(l) {
  const label = String(l.label || '').toLowerCase()
  const url = String(l.url || '').toLowerCase()
  return label.includes('github') || url.includes('github.com')
}

function isMail(l) {
  const label = String(l.label || '').toLowerCase()
  const url = String(l.url || '').toLowerCase()
  return label.includes('mail') || label.includes('邮箱') || url.startsWith('mailto:')
}
</script>

<style scoped>
.intro {
  text-align: center;
}

.intro-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto 12px;
  overflow: hidden;
  background: var(--primary-soft);
  display: grid;
  place-items: center;
}

.intro-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 28px;
  color: var(--primary);
}

.intro-name {
  font-size: var(--fs-body);
  font-weight: 700;
  margin-bottom: 6px;
}

.intro-bio {
  font-size: var(--fs-xs);
  color: var(--text-2);
  line-height: 1.7;
  margin-bottom: 12px;
}

.intro-links {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.link-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--text-2);
  background: var(--primary-soft);
  transition: color 0.2s, background-color 0.2s, transform 0.15s;
}

.svg-icon {
  width: 18px;
  height: 18px;
}

.link-icon:hover {
  color: #fff;
  background: var(--primary);
  transform: translateY(-2px);
}
</style>
