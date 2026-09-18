<template>
  <div class="tag-select">
    <!-- 已选标签（点 × 可删除） -->
    <div v-if="modelValue.length" class="tag-chips">
      <el-tag v-for="t in modelValue" :key="t" closable type="info" @close="remove(t)">{{ t }}</el-tag>
    </div>

    <!-- 两级联动：大类 → 子小类 -->
    <div class="tag-picker">
      <el-select v-model="parent" placeholder="选择大类" class="picker" @change="onParentChange">
        <el-option v-for="c in categories" :key="c.name" :label="c.name" :value="c.name" />
        <el-option value="__add__" label="＋ 新增大类" />
      </el-select>
      <el-select v-model="child" placeholder="选择子小类" class="picker" :disabled="!parent" @change="onChildChange">
        <el-option v-for="c in children" :key="c" :label="c" :value="c" />
        <el-option value="__add__" label="＋ 新增子小类" />
      </el-select>
      <el-button @click="manageVisible = true">管理</el-button>
    </div>

    <!-- 管理分类：删掉加错的大类 / 子小类 -->
    <el-dialog v-model="manageVisible" title="管理标签分类" width="480px" append-to-body>
      <div class="cat-manage">
        <div v-for="c in categories" :key="c.name" class="cat-row">
          <div class="cat-parent">
            <span class="cat-name">{{ c.name }}</span>
            <el-button link type="danger" size="small" @click="removeCat('', c.name)">删除大类</el-button>
          </div>
          <div class="cat-children">
            <span v-for="ch in c.children || []" :key="ch" class="child-chip">
              {{ ch }}
              <button class="chip-del" type="button" title="删除该子小类" @click="removeCat(c.name, ch)">✕</button>
            </span>
            <span v-if="!(c.children || []).length" class="cat-empty">暂无子小类</span>
          </div>
        </div>
        <p v-if="!categories.length" class="cat-empty">暂无分类</p>
      </div>
      <template #footer>
        <el-button @click="manageVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import { ElMessageBox } from 'element-plus/es/components/message-box/index'
import { fetchTagCategories, createTagCategory, deleteTagCategory } from '@/api/tagCategory'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue'])

const categories = ref([])
const parent = ref('')
const child = ref('')
const manageVisible = ref(false)

const children = computed(() => categories.value.find((c) => c.name === parent.value)?.children || [])

async function load() {
  const data = await fetchTagCategories()
  categories.value = data.list || []
}

function remove(tag) {
  emit('update:modelValue', props.modelValue.filter((t) => t !== tag))
}

function addTag(tag) {
  if (!props.modelValue.includes(tag)) {
    emit('update:modelValue', [...props.modelValue, tag])
  }
}

// 选大类：选中「＋ 新增大类」时弹窗输入并写库
async function onParentChange(val) {
  if (val === '__add__') {
    parent.value = ''
    try {
      const { value } = await ElMessageBox.prompt('请输入新的大类名称', '新增大类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      const name = String(value || '').trim()
      if (!name) return
      const data = await createTagCategory({ name })
      categories.value = data.list || []
      parent.value = name
      ElMessage.success(`已新增大类「${name}」`)
    } catch (e) {
      /* 取消输入 */
    }
  } else {
    child.value = ''
  }
}

// 选子小类：选中「＋ 新增子小类」同上，否则加入已选标签并清空两个下拉
async function onChildChange(val) {
  if (val === '__add__') {
    child.value = ''
    try {
      const { value } = await ElMessageBox.prompt(`请输入「${parent.value}」下的子小类名称`, '新增子小类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      const name = String(value || '').trim()
      if (!name) return
      const data = await createTagCategory({ parent: parent.value, name })
      categories.value = data.list || []
      addTag(`${parent.value}/${name}`)
      parent.value = ''
      child.value = ''
      ElMessage.success(`已新增子小类「${name}」`)
    } catch (e) {
      /* 取消输入 */
    }
  } else if (val) {
    addTag(`${parent.value}/${val}`)
    parent.value = ''
    child.value = ''
  }
}

// 删除大类 / 子小类
async function removeCat(parentName, name) {
  const label = parentName ? `${parentName}/${name}` : name
  try {
    await ElMessageBox.confirm(`确定删除「${label}」？`, '删除确认', { type: 'warning' })
  } catch (e) {
    return
  }
  const data = await deleteTagCategory(parentName ? { parent: parentName, name } : { name })
  categories.value = data.list || []
  if (parent.value === name && !parentName) parent.value = ''
  ElMessage.success('已删除')
}

onMounted(load)
</script>

<style scoped>
.tag-select {
  width: 100%;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.picker {
  flex: 1;
  min-width: 120px;
}

/* 管理分类弹窗 */
.cat-row {
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.cat-row:last-child {
  border-bottom: none;
}

.cat-parent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.cat-name {
  font-weight: 600;
}

.cat-children {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.child-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: var(--fs-xs);
}

.chip-del {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  padding: 0;
  opacity: 0.7;
}

.chip-del:hover {
  opacity: 1;
}

.cat-empty {
  font-size: var(--fs-xs);
  color: var(--text-3);
}
</style>
