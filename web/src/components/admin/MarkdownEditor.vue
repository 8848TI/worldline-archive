<template>
  <div class="md-editor">
    <!-- 工具栏 -->
    <div class="md-toolbar">
      <button v-for="t in tools" :key="t.key" class="md-btn" :title="t.title" type="button" @click="apply(t)">
        {{ t.label }}
      </button>

      <span class="md-spacer"></span>

      <!-- 插入图片（上传后写入 ![](url)） -->
      <el-upload :show-file-list="false" :http-request="uploadImg" accept="image/*">
        <button class="md-btn" title="上传并插入图片" type="button">🖼 图片</button>
      </el-upload>

      <!-- 导入本地 .md 文件 -->
      <label class="md-btn" title="导入 Markdown 文件">
        📂 导入
        <input type="file" accept=".md,.markdown,.txt" hidden @change="importMd" />
      </label>

      <button class="md-btn" :class="{ active: showPreview }" title="切换预览" type="button" @click="showPreview = !showPreview">
        👁 预览
      </button>
    </div>

    <!-- 编辑区 / 预览区 -->
    <div class="md-body">
      <textarea
        ref="taRef"
        class="md-input"
        :value="modelValue"
        placeholder="支持 Markdown 语法，或点上方「导入」载入 .md 文件…"
        @input="onInput"
      ></textarea>
      <div v-if="showPreview" class="md-preview markdown-body" v-html="html"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadImage } from '@/api/upload'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const taRef = ref(null)
const showPreview = ref(false)

const html = computed(() => renderMarkdown(props.modelValue))

// 工具栏：wrap = 首尾包裹；prefix = 行首插入；insert = 直接插入
const tools = [
  { key: 'bold', label: 'B', title: '加粗', wrap: ['**', '**'], ph: '粗体' },
  { key: 'italic', label: 'I', title: '斜体', wrap: ['*', '*'], ph: '斜体' },
  { key: 'strike', label: 'S', title: '删除线', wrap: ['~~', '~~'], ph: '删除线' },
  { key: 'h2', label: 'H2', title: '二级标题', prefix: '## ' },
  { key: 'h3', label: 'H3', title: '三级标题', prefix: '### ' },
  { key: 'quote', label: '❝', title: '引用', prefix: '> ' },
  { key: 'ul', label: '•', title: '无序列表', prefix: '- ' },
  { key: 'ol', label: '1.', title: '有序列表', prefix: '1. ' },
  { key: 'code', label: '</>', title: '代码块', wrap: ['```\n', '\n```'], ph: 'code' },
  { key: 'link', label: '🔗', title: '链接', wrap: ['[', '](https://)'], ph: '链接文字' },
  { key: 'hr', label: '—', title: '分割线', insert: '\n---\n' }
]

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

// 在光标处插入文本
function insertAt(text, start, end, snippet) {
  const next = text.slice(0, start) + snippet + text.slice(end)
  emit('update:modelValue', next)
  nextTick(() => {
    const ta = taRef.value
    if (!ta) return
    ta.focus()
    const pos = start + snippet.length
    ta.setSelectionRange(pos, pos)
  })
}

function apply(tool) {
  const ta = taRef.value
  if (!ta) return
  const text = props.modelValue || ''
  const start = ta.selectionStart
  const end = ta.selectionEnd

  if (tool.insert) {
    insertAt(text, start, end, tool.insert)
    return
  }

  if (tool.prefix) {
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    const next = text.slice(0, lineStart) + tool.prefix + text.slice(lineStart)
    emit('update:modelValue', next)
    nextTick(() => {
      ta.focus()
      const pos = start + tool.prefix.length
      ta.setSelectionRange(pos, end + tool.prefix.length)
    })
    return
  }

  if (tool.wrap) {
    const sel = text.slice(start, end) || tool.ph || ''
    const next = text.slice(0, start) + tool.wrap[0] + sel + tool.wrap[1] + text.slice(end)
    emit('update:modelValue', next)
    nextTick(() => {
      ta.focus()
      ta.setSelectionRange(start + tool.wrap[0].length, start + tool.wrap[0].length + sel.length)
    })
  }
}

// 上传图片并插入 Markdown 图片语法
async function uploadImg({ file, onSuccess, onError }) {
  try {
    const data = await uploadImage(file)
    const ta = taRef.value
    const text = props.modelValue || ''
    const pos = ta ? ta.selectionEnd : text.length
    insertAt(text, pos, pos, `\n![${file.name}](${data.url})\n`)
    ElMessage.success('图片已插入')
    onSuccess(data)
  } catch (e) {
    ElMessage.error('上传失败')
    onError(e)
  }
}

// 导入本地 .md 文件
async function importMd(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return

  if (props.modelValue && props.modelValue.trim()) {
    try {
      await ElMessageBox.confirm('导入会覆盖当前正文内容，确定继续？', '导入 Markdown', { type: 'warning' })
    } catch (err) {
      return
    }
  }

  const reader = new FileReader()
  reader.onload = () => {
    emit('update:modelValue', String(reader.result || ''))
    ElMessage.success(`已导入「${file.name}」`)
  }
  reader.onerror = () => ElMessage.error('读取文件失败')
  reader.readAsText(file, 'utf-8')
}
</script>

<style scoped>
.md-editor {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface);
}

.md-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.md-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-2);
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.md-btn:hover {
  background: var(--primary-soft);
  color: var(--text);
}

.md-btn.active {
  background: var(--primary-soft);
  color: var(--primary);
}

.md-spacer {
  flex: 1;
}

.md-body {
  display: flex;
  min-height: 340px;
}

.md-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: none;
  outline: none;
  resize: vertical;
  background: transparent;
  color: var(--text);
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
  line-height: 1.8;
}

.md-preview {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border-left: 1px solid var(--border);
  overflow-y: auto;
  max-height: 560px;
}

@media (max-width: 720px) {
  .md-body {
    flex-direction: column;
  }
  .md-preview {
    border-left: none;
    border-top: 1px solid var(--border);
  }
}
</style>
