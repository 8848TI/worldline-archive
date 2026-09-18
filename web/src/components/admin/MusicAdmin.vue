<template>
  <div>
    <div class="admin-section-head">
      <h2 class="admin-section-title">音乐管理</h2>
      <el-button type="primary" round @click="openForm()">新增音乐</el-button>
    </div>

    <div v-if="loading" class="glass-card"><el-skeleton :rows="5" animated /></div>
    <div v-else class="admin-list">
      <div v-for="item in list" :key="item.id" class="admin-item glass-card">
        <div class="admin-item-info">
          <span class="admin-item-title">{{ item.title }}</span>
          <span class="admin-item-sub">{{ item.artist }}</span>
        </div>
        <div class="admin-item-actions">
          <el-button size="small" @click="openForm(item)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="remove(item)">删除</el-button>
        </div>
      </div>
      <p v-if="!list.length" class="admin-empty">暂无音乐</p>
    </div>

    <el-dialog v-model="formVisible" :title="form.id ? '编辑音乐' : '新增音乐'" width="560px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="歌名" />
        </el-form-item>
        <el-form-item label="作者" prop="artist">
          <el-input v-model="form.artist" placeholder="歌手 / 作者" />
        </el-form-item>
        <el-form-item label="音频文件" prop="audioUrl">
          <div class="upload-row">
            <el-upload :show-file-list="false" :http-request="onUploadAudio" accept="audio/*">
              <el-button :loading="uploading">{{ uploading ? '上传中…' : '上传音频' }}</el-button>
            </el-upload>
            <span class="upload-tip">支持 mp3 / wav / ogg / m4a / flac，≤30MB</span>
          </div>
          <el-progress v-if="uploading" :percentage="percent" :stroke-width="6" class="upload-progress" />
          <el-input v-model="form.audioUrl" class="upload-input" placeholder="或直接填写音频链接 https://...mp3" />
          <div class="audio-meta">时长：{{ form.duration ? formatTime(form.duration) : '未识别（未知长度）' }}</div>
        </el-form-item>
        <el-form-item label="专辑">
          <el-input v-model="form.album" placeholder="专辑（选填）" />
        </el-form-item>
        <el-form-item label="封面">
          <div class="upload-row">
            <img v-if="form.cover" :src="form.cover" class="cover-preview" alt="封面" />
            <el-upload :show-file-list="false" :http-request="onUploadCover" accept="image/*">
              <el-button>{{ form.cover ? '重新上传封面' : '上传封面' }}</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <TagSelect v-model="form.tags" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchMusicList } from '@/api/music'
import { createContent, updateContent, deleteContent } from '@/api/content'
import { uploadAudio, uploadImage } from '@/api/upload'
import { formatTime } from '@/utils/format'
import TagSelect from './TagSelect.vue'

const list = ref([])
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const percent = ref(0)
const formVisible = ref(false)
const formRef = ref(null)
const form = reactive({ id: '', title: '', artist: '', audioUrl: '', album: '', cover: '', tags: [], duration: 0 })

// 读取本地音频文件的时长（秒）：用 <audio> 解析元数据，无需上传后由服务端探测
function readAudioDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const el = new Audio()
    el.preload = 'metadata'
    const done = (v) => {
      URL.revokeObjectURL(url)
      resolve(v)
    }
    el.onloadedmetadata = () => done(Math.round(el.duration) || 0)
    el.onerror = () => done(0)
    el.src = url
  })
}

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  artist: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  audioUrl: [{ required: true, message: '请输入音频地址', trigger: 'blur' }],
  tags: [{ validator: (r, v, cb) => (v && v.length ? cb() : cb(new Error('请至少选择一个标签'))), trigger: 'change' }]
}

async function load() {
  loading.value = true
  try {
    const data = await fetchMusicList()
    list.value = data.list
  } finally {
    loading.value = false
  }
}

// 上传音频文件（真实环境走后端 /api/upload/audio）
async function onUploadAudio({ file, onSuccess, onError }) {
  if (file.size > 30 * 1024 * 1024) {
    ElMessage.error('音频不能超过 30MB，请压缩后再上传')
    onError(new Error('file too large'))
    return
  }
  uploading.value = true
  percent.value = 0
  try {
    const data = await uploadAudio(file, (e) => {
      if (e.total) percent.value = Math.min(99, Math.round((e.loaded / e.total) * 100))
    })
    form.audioUrl = data.url
    // 上传成功后解析并记录时长
    const duration = await readAudioDuration(file)
    if (duration) form.duration = duration
    percent.value = 100
    formRef.value?.validateField?.('audioUrl')
    ElMessage.success(duration ? `音频上传成功（时长 ${formatTime(duration)}）` : '音频上传成功，未能识别时长')
    onSuccess(data)
  } catch (e) {
    ElMessage.error('上传失败')
    onError(e)
  } finally {
    uploading.value = false
  }
}

// 上传封面图
async function onUploadCover({ file, onSuccess, onError }) {
  try {
    const data = await uploadImage(file)
    form.cover = data.url
    ElMessage.success('封面上传成功')
    onSuccess(data)
  } catch (e) {
    onError(e)
  }
}

function openForm(item) {
  if (item) {
    Object.assign(form, {
      id: item.id,
      title: item.title,
      artist: item.artist,
      audioUrl: item.audioUrl || '',
      album: item.album || '',
      cover: item.cover || '',
      tags: [...(item.tags || [])],
      duration: item.duration || 0
    })
  } else {
    Object.assign(form, { id: '', title: '', artist: '', audioUrl: '', album: '', cover: '', tags: [], duration: 0 })
  }
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

// 从地址探测时长（用于直接填链接、或编辑历史数据补齐时长）
function readDurationFromUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(0)
    const el = new Audio()
    el.preload = 'metadata'
    el.onloadedmetadata = () => resolve(Math.round(el.duration) || 0)
    el.onerror = () => resolve(0)
    el.src = url
  })
}

async function save() {
  await formRef.value.validate()
  saving.value = true
  try {
    // 时长缺失时保存前补测一次
    if (!form.duration && form.audioUrl) {
      const d = await readDurationFromUrl(form.audioUrl)
      if (d) form.duration = d
    }
    const payload = {
      type: 'music',
      title: form.title,
      cover: form.cover,
      tags: form.tags,
      ext: { music: { artist: form.artist, album: form.album, audioUrl: form.audioUrl, duration: form.duration } }
    }
    if (form.id) await updateContent(form.id, payload)
    else await createContent(payload)
    ElMessage.success('已保存')
    formVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function remove(item) {
  try {
    await ElMessageBox.confirm(`确定删除「${item.title}」？`, '删除确认', { type: 'warning' })
  } catch (e) {
    return
  }
  await deleteContent(item.id)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<style scoped>
.upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-tip {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.upload-progress {
  width: 100%;
  margin-top: 10px;
}

.upload-input {
  margin-top: 10px;
}

.audio-meta {
  width: 100%;
  margin-top: 8px;
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.cover-preview {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
</style>
