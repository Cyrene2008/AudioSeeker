// 检索页共享状态：离开页面再返回时保留检索结果与参数
import { reactive } from 'vue'

export const searchState = reactive({
  indexes: [],
  selectedIndex: '',
  sample: '',
  fromS: 0,
  toS: '',
  minAligned: 8,
  minRatio: '',
  occs: [],
  selected: new Set(),
  lastMeta: null,
  searched: false
})
