import { reactive } from 'vue'
import { api } from '../utils/api'

export const indexState = reactive({
  items: [],
  loaded: false,
  refreshing: false,
  error: ''
})

let inFlight = null
let generation = 0

function mergeLightweight(items) {
  const previous = new Map(indexState.items.map((item) => [item.name, item]))
  return items.map((item) => {
    const old = previous.get(item.name)
    if (!old) return item
    return {
      ...item,
      total_hashes: item.total_hashes ?? old.total_hashes,
      segments: item.segments.map((segment) => {
        const oldSegment = old.segments?.find((candidate) => candidate.name === segment.name)
        return oldSegment ? { ...oldSegment, ...segment, files: segment.files ?? oldSegment.files,
          hashes: segment.hashes ?? oldSegment.hashes, size: segment.size ?? oldSegment.size } : segment
      })
    }
  })
}

export async function refreshIndexes({ includeStats = false, refreshStats = false, force = false } = {}) {
  if (inFlight && !force) return inFlight
  const requestGeneration = ++generation
  indexState.refreshing = true
  indexState.error = ''
  const query = new URLSearchParams({
    include_stats: String(includeStats),
    refresh_stats: String(refreshStats)
  })
  const request = api.get(`/api/indexes?${query}`)
    .then((items) => {
      if (requestGeneration !== generation) return indexState.items
      indexState.items = includeStats ? items : mergeLightweight(items)
      indexState.loaded = true
      return indexState.items
    })
    .catch((error) => {
      if (requestGeneration === generation) indexState.error = error.message
      throw error
    })
    .finally(() => {
      if (requestGeneration === generation) indexState.refreshing = false
      if (inFlight === request) inFlight = null
    })
  inFlight = request
  return request
}
