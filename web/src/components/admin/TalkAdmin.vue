<template>
  <div>
    <div class="admin-section-head">
      <h2 class="admin-section-title">说说管理</h2>
      <el-button type="primary" round @click="openForm()">新增说说</el-button>
    </div>

    <div v-if="loading" class="glass-card"><el-skeleton :rows="5" animated /></div>
    <div v-else class="admin-list">
      <div v-for="item in list" :key="item.id" class="admin-item glass-card">
        <div class="admin-item-info">
          <span class="admin-item-title">{{ item.title }}</span>
          <span class="admin-item-sub">{{ item.summary }}</span>
        </div>
        <div class="admin-item-actions">
          <el-button size="small" @click="openForm(item)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="remove(item)">删除</el-button>
        </div>
      </div>
      <p v-if="!list.length" class="admin-empty">暂无说说</p>
    </div>

    <el-dialog v-model="formVisible" :title="form.id ? '编辑说说' : '新增说说'" width="620px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="说说标题" />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="写点什么…" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <TagSelect v-model="form.tags" />
        </el-form-item>
        <el-form-item label="图片（选填，可多张）">
          <div class="img-grid">
            <div v-for="(url, i) in form.images" :key="i" class="img-item">
              <img :src="url" alt="" />
              <button class="img-del" type="button" @click="form.images.splice(i, 1)">✕</button>
            </div>
            <el-upload :show-file-list="false" :http-request="onUpload" accept="image/*">
              <div class="img-add">＋</div>
            </el-upload>
          </div>
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
import TagSelect from './TagSelect.vue'

const list = ref([])
const loading = ref(true)
const saving = ref(false)
const formVisible = ref(false)
const formRef = ref(null)
const form = reactive({ id: '', title: '', content: '', tags: [], images: [] })

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文', trigger: 'blur' }],
  tags: [{ validator: (r, v, cb) => (v && v.length ? cb() : cb(new Error('请至少选择一个标签'))), trigger: 'change' }]
}

async function load() {
  loading.value = true
  try {
    const data = await fetchContentList({ type: 'essay', pageSize: 50 })
    list.value = data.list
  } finally {
    loading.value = false
  }
}

async function onUpload({ file, onSuccess, onError }) {
  try {
    const data = await uploadImage(file)
    form.images.push(data.url)
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
      title: item.title,
      content: item.ext?.article?.content || '',
      tags: [...(item.tags || [])],
      images: [...(item.ext?.article?.images || [])]
    })
  } else {
    Object.assign(form, { id: '', title: '', content: '', tags: [], images: [] })
  }
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

// 简介自动从正文截取
function autoSummary(text) {
  return String(text || '').replace(/[#*`>\n\r]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)
}

async function save() {
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = {
      type: 'essay',
      title: form.title,
      summary: autoSummary(form.content),
      cover: form.images[0] || '',
      tags: form.tags,
      ext: { article: { content: form.content, images: form.images, wordCount: form.content.length } }
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
