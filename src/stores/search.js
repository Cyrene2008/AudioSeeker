// 检索页共享状态：离开页面再返回时保留检索结果与参数
import { reactive } from 'vue'
import { api } from '../utils/api'

export const searchState = reactive({
  selectedIndex: '',
  sample: '',
  fromS: 0,
  toS: '',
  minAligned: 8,
  minRatio: '',
  searchThreads: 0,
  searchMemoryMb: 0,
  mergeResults: false,
  occs: [],
  selected: new Set(),
  lastMeta: null,
  searched: false,
  busy: false,
  error: ''
})

let inFlight = null

export function startSearch(body) {
  if (inFlight) return inFlight
  searchState.busy = true
  searchState.error = ''
  const request = api.post('/api/match', body)
    .then((result) => {
      searchState.lastMeta = result
      searchState.occs = (result.occurrences || []).map((occurrence) => ({
        ...occurrence,
        index_name: body.index_name,
        segment: body.segment
      }))
      searchState.selected.clear()
      searchState.searched = true
      return result
    })
    .catch((error) => {
      searchState.error = error.message
      throw error
    })
    .finally(() => {
      searchState.busy = false
      inFlight = null
    })
  inFlight = request
  return request
}
