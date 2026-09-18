<template>
  <div class="admin">
    <aside class="admin-side glass-card">
      <div class="admin-brand">⚙️ 后台管理</div>
      <nav class="admin-nav">
        <button
          v-for="s in sections"
          :key="s.key"
          class="admin-nav-item"
          :class="{ active: active === s.key }"
          @click="active = s.key"
        >
          <span class="nav-emoji">{{ s.emoji }}</span>{{ s.label }}
        </button>
      </nav>
      <div class="admin-user">👤 {{ username || 'admin' }}</div>
      <button class="admin-back" @click="logout">退出登录</button>
      <button class="admin-back" @click="$router.push('/')">← 返回博客</button>
    </aside>

    <main class="admin-main glass-card">
      <ArticleAdmin v-if="active === 'article'" />
      <TalkAdmin v-else-if="active === 'talk'" />
      <ProjectAdmin v-else-if="active === 'project'" />
      <ToolAdmin v-else-if="active === 'tool'" />
      <MediaAdmin v-else-if="active === 'media'" />
      <MusicAdmin v-else-if="active === 'music'" />
      <WallpaperAdmin v-else-if="active === 'wallpaper'" />
      <HeroAdmin v-else />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { clearAuth, getUsername } from '@/utils/authToken'
import ArticleAdmin from '@/components/admin/ArticleAdmin.vue'
import TalkAdmin from '@/components/admin/TalkAdmin.vue'
import ProjectAdmin from '@/components/admin/ProjectAdmin.vue'
import ToolAdmin from '@/components/admin/ToolAdmin.vue'
import MediaAdmin from '@/components/admin/MediaAdmin.vue'
import MusicAdmin from '@/components/admin/MusicAdmin.vue'
import WallpaperAdmin from '@/components/admin/WallpaperAdmin.vue'
import HeroAdmin from '@/components/admin/HeroAdmin.vue'

const router = useRouter()
const active = ref('article')
const username = ref(getUsername())

// 退出登录：清除本地 token 后回首页
function logout() {
  clearAuth()
  ElMessage.success('已退出登录')
  router.push('/')
}

// 8 个模块：文章 / 说说 / 项目 / 工具箱 / 影视 / 音乐 / 壁纸插画 / 横幅
const sections = [
  { key: 'article', label: '文章管理', emoji: '📝' },
  { key: 'talk', label: '说说管理', emoji: '💬' },
  { key: 'project', label: '项目管理', emoji: '📦' },
  { key: 'tool', label: '工具箱管理', emoji: '🧰' },
  { key: 'media', label: '影视管理', emoji: '🎬' },
  { key: 'music', label: '音乐管理', emoji: '🎵' },
  { key: 'wallpaper', label: '壁纸插画', emoji: '🖼️' },
  { key: 'hero', label: '横幅管理', emoji: '🎞️' }
]
</script>

<style scoped>
.admin {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.admin-side {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-brand {
  font-size: var(--fs-h3);
  font-weight: 700;
  margin-bottom: 10px;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font-size: var(--fs-body);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s, color 0.2s;
}

.nav-emoji {
  flex-shrink: 0;
}

.admin-nav-item:hover {
  background: var(--primary-soft);
  color: var(--text);
}

.admin-nav-item.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}

.admin-user {
  margin-top: 12px;
  font-size: var(--fs-xs);
  color: var(--text-3);
  text-align: center;
}

.admin-back {
  margin-top: 8px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  font-size: var(--fs-sm);
  transition: background-color 0.2s, color 0.2s;
}

.admin-back:hover {
  color: var(--text);
  background: var(--primary-soft);
}

.admin-main {
  min-height: 480px;
}

@media (max-width: 720px) {
  .admin {
    /* minmax(0, 1fr) 防止内容把单列撑出容器造成横向滚动 */
    grid-template-columns: minmax(0, 1fr);
  }
  .admin-side {
    position: static;
    flex-direction: column;
  }
}
</style>
