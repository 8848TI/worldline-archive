import { ref, computed, watch } from 'vue'

// 通用客户端分页：传入一个 ref / computed 列表，返回分页后的数据与状态。
// 列表变化（如筛选切换、重新加载）时自动回到第一页。
export function usePagination(list, pageSize = 12) {
  const page = ref(1)
  const total = computed(() => list.value?.length || 0)
  const paged = computed(() =>
    (list.value || []).slice((page.value - 1) * pageSize, page.value * pageSize)
  )
  // 列表长度变化时重置到第一页
  watch(total, () => {
    page.value = 1
  })
  return { page, pageSize, total, paged }
}
