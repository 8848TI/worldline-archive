<template>
  <div>
    <div class="admin-section-head">
      <h2 class="admin-section-title">横幅管理</h2>
      <el-button type="primary" round :loading="saving" @click="save">保存</el-button>
    </div>

    <!-- 当前效果预览 -->
    <div class="hero-preview glass-card">
      <template v-if="form.mode === 'video'">
        <video v-if="form.video" :src="form.video" autoplay muted loop playsinline></video>
        <div v-else class="hero-empty">未设置视频</div>
      </template>
      <template v-else>
        <img v-if="form.images.length" :src="form.images[previewIndex]" alt="" />
        <div v-else class="hero-empty">未上传图片</div>
      </template>
      <span class="hero-label">
        {{ form.mode === 'video' ? '视频横幅预览' : `图片轮播预览（共 ${form.images.length} 张）` }}
      </span>
    </div>

    <el-form label-position="top" @submit.prevent>
      <el-form-item label="横幅模式">
        <el-radio-group v-model="form.mode">
          <el-radio-button value="video">视频</el-radio-button>
          <el-radio-button value="carousel">图片轮播</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- ── 视频模式 ── -->
      <template v-if="form.mode === 'video'">
        <el-form-item label="横幅视频">
          <div class="hero-actions">
            <el-upload :show-file-list="false" :http-request="onUploadVideo" accept="video/*">
              <el-button :loading="uploading">{{ uploading ? '上传中…' : '上传视频' }}</el-button>
            </el-upload>
            <span class="hero-tip">最大 30MB；建议 1080p、时长 ≤20 秒、码率 3–5Mbps（约 3–8MB）</span>
          </div>
          <el-progress v-if="uploading" :percentage="percent" :stroke-width="6" class="hero-progress" />
          <p class="hero-hint">
            提示：视频请先用剪辑软件或 HandBrake 压成 H.264 再上传，体积越小首页加载越快；也可以直接填外链，不占用服务器存储。
          </p>
        </el-form-item>

        <el-form-item label="视频地址（也可直接填写外链）">
          <el-input v-model="form.video" placeholder="https://...mp4 或 /uploads/xxx.mp4" clearable />
        </el-form-item>

        <el-form-item label="氛围图（视频不可用时的回退图，选填）">
          <el-input v-model="form.image" placeholder="图片 URL" clearable />
        </el-form-item>
      </template>

      <!-- ── 图片轮播模式 ── -->
      <template v-else>
        <el-form-item label="轮播图片（按顺序淡入淡出）">
          <div class="img-grid">
            <div v-for="(url, i) in form.images" :key="i" class="img-item">
              <img :src="url" alt="" />
              <button class="img-del" type="button" @click="form.images.splice(i, 1)">✕</button>
            </div>
            <el-upload :show-file-list="false" :http-request="onUploadImage" accept="image/*">
              <div class="img-add">＋</div>
            </el-upload>
          </div>
          <p class="hero-hint">建议 2–5 张横图（1920×1080 左右），单张 ≤2MB，加载更快。</p>
        </el-form-item>

        <el-form-item label="切换间隔">
          <el-input-number v-model="form.interval" :min="2" :max="20" />
          <span class="hero-unit">秒</span>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import { uploadImage, uploadVideo } from '@/api/upload'
import { useSiteStore } from '@/stores/site'

const siteStore = useSiteStore()
const saving = ref(false)
const uploading = ref(false)
const percent = ref(0)
const form = reactive({ mode: 'video', video: '', image: '', images: [], interval: 5 })

// 与后端 multer 限制保持一致（30MB）
const MAX_VIDEO_MB = 30

// ── 预览轮播 ──
const previewIndex = ref(0)
let previewTimer = null

function restartPreview() {
  if (previewTimer) {
    clearInterval(previewTimer)
    previewTimer = null
  }
  previewIndex.value = 0
  if (form.mode !== 'carousel' || form.images.length < 2) return
  previewTimer = setInterval(() => {
    previewIndex.value = (previewIndex.value + 1) % form.images.length
  }, Math.max(2, Number(form.interval) || 5) * 1000)
}

watch(() => [form.mode, form.images.length, form.interval], restartPreview, { immediate: true })
onUnmounted(() => {
  if (previewTimer) clearInterval(previewTimer)
})

onMounted(async () => {
  await siteStore.load()
  Object.assign(form, {
    mode: siteStore.hero.mode || 'video',
    video: siteStore.hero.video || '',
    image: siteStore.hero.image || '',
    images: [...(siteStore.hero.images || [])],
    interval: Number(siteStore.hero.interval) || 5
  })
})

// 上传视频（真实环境走后端 /api/upload/video）
async function onUploadVideo({ file, onSuccess, onError }) {
  const sizeMB = file.size / 1024 / 1024
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    ElMessage.error(`视频不能超过 ${MAX_VIDEO_MB}MB（当前 ${sizeMB.toFixed(1)}MB），请先压缩后再上传`)
    onError(new Error('file too large'))
    return
  }
  uploading.value = true
  percent.value = 0
  try {
    const data = await uploadVideo(file, (e) => {
      if (e.total) percent.value = Math.min(99, Math.round((e.loaded / e.total) * 100))
    })
    form.video = data.url
    percent.value = 100
    ElMessage.success('视频上传成功，点「保存」后首页生效')
    onSuccess(data)
  } catch (e) {
    ElMessage.error('上传失败')
    onError(e)
  } finally {
    uploading.value = false
  }
}

// 上传轮播图片
async function onUploadImage({ file, onSuccess, onError }) {
  try {
    const data = await uploadImage(file)
    form.images.push(data.url)
    ElMessage.success('图片已添加')
    onSuccess(data)
  } catch (e) {
    ElMessage.error('上传失败')
    onError(e)
  }
}

async function save() {
  if (form.mode === 'carousel' && !form.images.length) {
    ElMessage.warning('图片轮播模式至少需要上传一张图片')
    return
  }
  saving.value = true
  try {
    await siteStore.saveHero({
      mode: form.mode,
      video: form.video,
      image: form.image,
      images: form.images,
      interval: form.interval
    })
    ElMessage.success('已保存，首页横幅已更新')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.hero-preview {
  position: relative;
  aspect-ratio: 21 / 9;
  overflow: hidden;
  padding: 0;
  margin-bottom: 20px;
  display: grid;
  place-items: center;
  background: var(--bg-soft);
}

.hero-preview video,
.hero-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.8s ease;
}

.hero-empty {
  color: var(--text-3);
  font-size: var(--fs-sm);
}

.hero-label {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: var(--fs-xs);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-tip {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.hero-unit {
  margin-left: 10px;
  font-size: var(--fs-sm);
  color: var(--text-3);
}

.hero-progress {
  width: 100%;
  margin-top: 10px;
}

.hero-hint {
  width: 100%;
  margin-top: 10px;
  font-size: var(--fs-xs);
  color: var(--text-3);
  line-height: 1.7;
}
</style>
