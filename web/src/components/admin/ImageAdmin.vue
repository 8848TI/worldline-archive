<template>
  <div>
    <div class="admin-section-head">
      <h2 class="admin-section-title">图片管理</h2>
      <el-upload :show-file-list="false" :http-request="onUpload" accept="image/*">
        <el-button type="primary" round>上传图片</el-button>
      </el-upload>
    </div>

    <div v-if="images.length" class="image-grid">
      <div v-for="(img, i) in images" :key="i" class="image-card glass-card">
        <img :src="img.url" :alt="img.name" />
        <span class="image-name">{{ img.name }}</span>
      </div>
    </div>
    <p v-else class="admin-empty">暂无图片，点击「上传图片」试试</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/api/upload'

const images = ref([])

// 自定义上传：调用 api/upload（真实环境走后端，mock 环境返回占位图）
async function onUpload({ file, onSuccess, onError }) {
  try {
    const data = await uploadImage(file)
    images.value.unshift({ url: data.url, name: file.name })
    ElMessage.success('上传成功')
    onSuccess(data)
  } catch (e) {
    ElMessage.error('上传失败')
    onError(e)
  }
}
</script>
