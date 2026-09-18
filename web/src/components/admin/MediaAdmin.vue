<template>
  <div>
    <div class="admin-section-head">
      <h2 class="admin-section-title">影视管理</h2>
      <el-button type="primary" round @click="openForm()">新增影视</el-button>
    </div>

    <div v-if="loading" class="glass-card"><el-skeleton :rows="5" animated /></div>
    <div v-else class="admin-list">
      <div v-for="item in list" :key="item.id" class="admin-item glass-card">
        <div class="admin-item-info">
          <span class="admin-item-badge">{{ typeLabel(item.type) }}</span>
          <span class="admin-item-title">{{ item.title }}</span>
          <span class="admin-item-sub">{{ item.ext?.media?.year }} 年</span>
        </div>
        <div class="admin-item-actions">
          <el-button size="small" @click="openForm(item)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="remove(item)">删除</el-button>
        </div>
      </div>
      <p v-if="!list.length" class="admin-empty">暂无内容</p>
    </div>

    <el-dialog v-model="formVisible" :title="form.id ? '编辑影视' : '新增影视'" width="560px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="封面图片" prop="cover">
          <div class="cover-upload">
            <img v-if="form.cover" :src="form.cover" class="cover-preview" alt="封面" />
            <el-upload :show-file-list="false" :http-request="onUpload" accept="image/*">
              <el-button>{{ form.cover ? '重新上传' : '上传封面' }}</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="影视标题" />
        </el-form-item>
        <el-form-item label="内容类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option v-for="t in MEDIA_TYPES" :key="t" :label="typeLabel(t)" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="剧情简介" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <TagSelect v-model="form.tags" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input-number v-model="form.year" :min="1900" :max="2100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="集数" prop="episodes">
          <el-input-number v-model="form.episodes" :min="1" style="width: 100%" />
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
import { fetchContentList, createContent, updateContent, deleteContent } from '@/api/content'
import { uploadImage } from '@/api/upload'
import { MEDIA_TYPES, getCategory } from '@/constants/categories'
import TagSelect from './TagSelect.vue'

const list = ref([])
const loading = ref(true)
const saving = ref(false)
const formVisible = ref(false)
const formRef = ref(null)
const form = reactive({ id: '', cover: '', title: '', type: 'anime', summary: '', tags: [], year: null, episodes: null })

function typeLabel(t) {
  return getCategory(t).label
}

const rules = {
  cover: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择内容类型', trigger: 'change' }],
  summary: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  tags: [{ validator: (r, v, cb) => (v && v.length ? cb() : cb(new Error('请至少选择一个标签'))), trigger: 'change' }],
  year: [{ required: true, message: '请输入年份', trigger: 'change' }],
  episodes: [{ required: true, message: '请输入集数', trigger: 'change' }]
}

async function load() {
  loading.value = true
  try {
    const results = await Promise.all(MEDIA_TYPES.map((t) => fetchContentList({ type: t, pageSize: 50 })))
    list.value = results.flatMap((r) => r.list)
  } finally {
    loading.value = false
  }
}

async function onUpload({ file, onSuccess, onError }) {
  try {
    const data = await uploadImage(file)
    form.cover = data.url
    formRef.value?.validateField?.('cover')
    onSuccess(data)
  } catch (e) {
    ElMessage.error('上传失败')
    onError(e)
  }
}

function openForm(item) {
  if (item) {
    Object.assign(form, {
      id: item.id,
      cover: item.cover || '',
      title: item.title,
      type: item.type,
      summary: item.summary,
      tags: [...(item.tags || [])],
      year: item.ext?.media?.year ?? null,
      episodes: item.ext?.media?.episodes ?? null
    })
  } else {
    Object.assign(form, { id: '', cover: '', title: '', type: 'anime', summary: '', tags: [], year: null, episodes: null })
  }
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

async function save() {
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = {
      type: form.type,
      title: form.title,
      summary: form.summary,
      cover: form.cover,
      tags: form.tags,
      ext: { media: { year: form.year, episodes: form.episodes } }
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
.cover-upload {
  display: flex;
  align-items: center;
  gap: 14px;
}

.cover-preview {
  width: 84px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
</style>
