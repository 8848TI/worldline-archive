<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-mark">存</span>
        <span class="logo-text">{{ site.name }}</span>
      </router-link>

      <nav class="nav">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <el-icon class="nav-ico"><House /></el-icon>首页
        </router-link>
        <router-link to="/timeline" class="nav-link" active-class="active">
          <el-icon class="nav-ico"><Clock /></el-icon>归档
        </router-link>

        <router-link to="/projects" class="nav-link">
          <el-icon class="nav-ico"><FolderOpened /></el-icon>项目
        </router-link>

        <!-- 我的：说说 / 关于 / 工具 -->
        <el-dropdown trigger="hover" popper-class="site-dropdown" @command="onCommand">
          <span class="nav-link nav-drop">
            <el-icon class="nav-ico"><User /></el-icon>我的<el-icon class="drop-icon"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="/talks" :icon="ChatDotRound">日常说说</el-dropdown-item>
              <el-dropdown-item command="/about" :icon="InfoFilled">关于</el-dropdown-item>
              <el-dropdown-item command="/tools" :icon="Tools">工具箱</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <router-link to="/source" class="nav-link">
          <el-icon class="nav-ico"><Document /></el-icon>源码
        </router-link>

        <!-- 文娱集：影视 / 壁纸 / 音乐  -->
        <el-dropdown trigger="hover" popper-class="site-dropdown" @command="onCommand">
          <span class="nav-link nav-drop">
            <el-icon class="nav-ico"><Film /></el-icon>文娱集<el-icon class="drop-icon"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="/category/movie" :icon="VideoCamera">给到夯的影视</el-dropdown-item>
              <el-dropdown-item command="/music" :icon="Headset">音乐BGM</el-dropdown-item>
              <el-dropdown-item command="/wallpaper" :icon="Picture">壁纸插画</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </nav>

      <div class="actions">
        <el-input
          v-model="keyword"
          class="search"
          placeholder="搜索"
          :prefix-icon="Search"
          clearable
          @keyup.enter="onSearch"
        />
        <button class="icon-btn" title="播放器" @click="onPlayerClick">
          <el-icon :size="18"><Headset /></el-icon>
        </button>
        <button class="icon-btn" :title="isLoggedIn() ? '进入后台' : '登录'" @click="openLogin">
          <el-icon :size="18"><User /></el-icon>
        </button>
        <button class="icon-btn" :title="theme.isDark ? '切换到浅色' : '切换到深色'" @click="theme.toggle()">
          <el-icon :size="18"><Sunny v-if="theme.isDark" /><Moon v-else /></el-icon>
        </button>
        <button class="icon-btn menu-btn" @click="drawer = true">
          <el-icon :size="20"><Menu /></el-icon>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉导航 -->
    <el-drawer v-model="drawer" direction="rtl" size="240px" :with-header="false" append-to-body>
      <div class="drawer-nav">
        <router-link v-for="item in drawerLinks" :key="item.path" :to="item.path" class="drawer-link" @click="drawer = false">
          {{ item.label }}
        </router-link>
        <span v-for="item in drawerWips" :key="item" class="drawer-link is-wip" @click="wip(item)">{{ item }}</span>
      </div>
    </el-drawer>

    <!-- 登录弹窗：遮罩背景毛玻璃模糊 -->
    <el-dialog v-model="loginVisible" title="登录" width="360px" align-center append-to-body modal-class="blur-modal">
      <el-form label-position="top" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" style="width: 100%" :loading="logging" @click="onLogin">登录</el-button>
      </el-form>
    </el-dialog>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Headset,
  User,
  Menu,
  Sunny,
  Moon,
  ArrowDown,
  House,
  Clock,
  FolderOpened,
  Document,
  Film,
  VideoCamera,
  ChatDotRound,
  InfoFilled,
  Tools,
  Picture
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { usePlayerStore } from '@/stores/player'
import { site } from '@/config/site'
import { login } from '@/api/auth'
import { setAuth, isLoggedIn } from '@/utils/authToken'

const theme = useThemeStore()
const player = usePlayerStore()
const router = useRouter()

const keyword = ref('')
const drawer = ref(false)
const loginVisible = ref(false)
const logging = ref(false)
const username = ref('')
const password = ref('')

// 已登录则直接进后台，否则才弹登录框
function openLogin() {
  if (isLoggedIn()) {
    router.push('/admin')
    return
  }
  loginVisible.value = true
}

async function onLogin() {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  logging.value = true
  try {
    const data = await login({ username: username.value, password: password.value })
    setAuth(data.token, data.username)
    loginVisible.value = false
    username.value = ''
    password.value = ''
    ElMessage.success('登录成功')
    router.push('/admin')
  } catch (e) {
    /* 错误提示由 axios 拦截器统一处理 */
  } finally {
    logging.value = false
  }
}

// 移动端抽屉：真实页面 + 占位入口
const drawerLinks = [
  { path: '/', label: '首页' },
  { path: '/timeline', label: '归档' },
  { path: '/category', label: '分类' },
  { path: '/music', label: '音乐' },
  { path: '/wallpaper', label: '壁纸' },
  { path: '/tags', label: '标签' },
  { path: '/talks', label: '日常说说' },
  { path: '/projects', label: '项目' },
  { path: '/about', label: '关于' },
  { path: '/source', label: '源码' }
]
const drawerWips = []

// 下拉菜单指令：以 / 开头为路由跳转，wip: 开头为「建设中」占位
function onCommand(cmd) {
  if (!cmd) return
  if (cmd.startsWith('wip:')) return wip(cmd.slice(4))
  router.push(cmd)
}

function wip(name) {
  ElMessage.info(`「${name}」建设中，敬请期待`)
}

// 导航搜索：跳转首页并携带关键词
function onSearch() {
  const q = keyword.value.trim()
  if (q) router.push({ path: '/', query: { q } })
}

// 播放器按钮：有曲目则切播放/暂停，否则去音乐页
function onPlayerClick() {
  if (player.hasTrack) player.toggle()
  else router.push('/music')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px 16px 0;
}

.header-inner {
  width: 85%;
  max-width: 1400px;
  margin: 0 auto;
  height: var(--header-h);
  border-radius: var(--radius-lg);
  background: var(--header-glass);
  backdrop-filter: blur(28px) saturate(1.5);
  -webkit-backdrop-filter: blur(28px) saturate(1.5);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 14px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 15px;
  background: var(--primary);
}

.logo-text {
  font-size: 17px;
}

.nav {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  color: var(--text-2);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, background-color 0.2s;
}

.nav-ico {
  font-size: 16px;
}

.nav-link:hover {
  color: var(--text);
  background: var(--primary-soft);
}

.nav-link.active {
  color: var(--primary);
  background: var(--primary-soft);
  font-weight: 600;
}

.nav-drop {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.drop-icon {
  font-size: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search {
  width: 210px;
}

/* 搜索框：与导航栏同款毛玻璃样式 */
.search :deep(.el-input__wrapper) {
  background: var(--header-glass);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid var(--border);
  border-radius: 999px;
  box-shadow: none !important;
  transition: border-color 0.2s;
}

.search :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary);
}

.search :deep(.el-input__inner) {
  color: var(--text);
}

.search :deep(.el-input__inner::placeholder) {
  color: var(--text-3);
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background-color 0.2s, color 0.2s, transform 0.1s;
}

.icon-btn:hover {
  background: var(--primary-soft);
  color: var(--text);
}

.icon-btn:active {
  transform: scale(0.94);
}

.menu-btn {
  display: none;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 16px;
}

.drawer-link {
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: 15px;
  cursor: pointer;
}

.drawer-link:hover {
  color: var(--primary);
  background: var(--primary-soft);
}

.drawer-link.is-wip {
  color: var(--text-3);
}

@media (max-width: 1020px) {
  .nav,
  .search {
    display: none;
  }
  .menu-btn {
    display: grid;
  }
}

@media (max-width: 720px) {
  .app-header {
    padding: 10px 10px 0;
  }
  .header-inner {
    width: 92%;
    padding: 0 14px;
  }
}
</style>
