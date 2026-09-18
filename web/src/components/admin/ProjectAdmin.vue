<template>
  <div>
    <div class="admin-section-head">
      <h2 class="admin-section-title">项目管理</h2>
      <el-button type="primary" round @click="openForm()">新增项目</el-button>
    </div>

    <div v-if="loading" class="glass-card"><el-skeleton :rows="5" animated /></div>
    <div v-else class="admin-list">
      <div v-for="item in list" :key="item.id" class="admin-item glass-card">
        <div class="admin-item-info">
          <span class="admin-item-title">{{ item.title }}</span>
          <span class="admin-item-sub">{{ item.ext?.project?.url }}</span>
        </div>
        <div class="admin-item-actions">
          <el-button size="small" @click="openForm(item)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="remove(item)">删除</el-button>
        </div>
      </div>
      <p v-if="!list.length" class="admin-empty">暂无项目</p>
    </div>

    <el-dialog v-model="formVisible" :title="form.id ? '编辑项目' : '新增项目'" width="560px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="项目标题" />
        </el-form-item>
        <el-form-item label="简介" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="项目简介" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <TagSelect v-model="form.tags" />
        </el-form-item>
        <el-form-item label="GitHub 仓库地址" prop="url">
          <el-input v-model="form.url" placeholder="https://github.com/..." />
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
import TagSelect from './TagSelect.vue'

const list = ref([])
const loading = ref(true)
const saving = ref(false)
const formVisible = ref(false)
const formRef = ref(null)
const form = reactive({ id: '', title: '', summary: '', tags: [], url: '' })

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  tags: [{ validator: (r, v, cb) => (v && v.length ? cb() : cb(new Error('请至少选择一个标签'))), trigger: 'change' }],
  url: [{ required: true, message: '请输入 GitHub 仓库地址', trigger: 'blur' }]
}

async function load() {
  loading.value = true
  try {
    const data = await fetchContentList({ type: 'project', pageSize: 50 })
    list.value = data.list
  } finally {
    loading.value = false
  }
}

function openForm(item) {
  if (item) {
    Object.assign(form, {
      id: item.id,
      title: item.title,
      summary: item.summary,
      tags: [...(item.tags || [])],
      url: item.ext?.project?.url || ''
    })
  } else {
    Object.assign(form, { id: '', title: '', summary: '', tags: [], url: '' })
  }
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

async function save() {
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = {
      type: 'project',
      title: form.title,
      summary: form.summary,
      tags: form.tags,
      ext: { project: { url: form.url } }
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
    await ElMessageBox.confirm(`确定删除项目「${item.title}」？`, '删除确认', { type: 'warning' })
  } catch (e) {
    return
  }
  await deleteContent(item.id)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>
