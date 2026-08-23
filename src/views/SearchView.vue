<template>
  <div class="page">
    <h1 class="page-title">{{ t('search') }}</h1>

    <FluentSegmented class="two-option-segmented" :model-value="mode" :items="modeItems" @update:model-value="mode = $event" />

    <!-- ============ 检索 ============ -->
    <template v-if="mode === 'search'">
    <div class="form-row">
      <FluentComboBox
        class="grow"
        :items="indexItems"
        v-model="selectedIndex"
        :label="t('selectIndex')"
        :placeholder="t('indexPlaceholder')"
      />
      <FluentInput class="grow" :model-value="sample" :label="t('sample')" placeholder="*.wav / *.mp3 / *.flac / *.m4a…" readonly />
      <FluentButton variant="secondary" icon-only :title="t('browse')" @click="pickSample"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
    </div>

    <div class="form-row">
      <FluentInput v-model.number="fromS" type="number" :label="t('fromSec')" :min="0" />
      <FluentInput v-model.number="toS" type="number" :label="t('toSec')" :placeholder="t('toEnd')" :min="0" />
      <FluentInput v-model.number="minAligned" type="number" :label="t('minAligned')" :min="1" />
      <FluentInput v-model.number="minRatio" type="number" :label="t('minRatio')" :placeholder="t('autoRatio')" :min="0" />
      <FluentInput v-model.number="searchThreads" type="number" :label="t('searchThreads')" :placeholder="t('autoZero')" :min="0" />
      <FluentInput v-model.number="searchMemoryMb" type="number" :label="t('memoryBudgetMb')" :placeholder="t('autoZero')" :min="0" />
      <FluentButton class="match-button" :disabled="busy" @click="doMatch">
        <FluentProgressRing v-if="busy" :size="16" />
        {{ busy ? t('matching') : t('startMatch') }}
      </FluentButton>
    </div>

    <FluentInfoBar v-if="!indexes.length && !busy && backendUp.ready" severity="warning" :title="t('noIndex')" />
    <FluentInfoBar v-if="!backendUp.ready && !busy" severity="warning" title="正在连接后端…" style="margin-top:6px">
      <template #default>首次启动需等待后端初始化（加载索引通常需要 10~30 秒），完成后此提示会自动消失。</template>
    </FluentInfoBar>
    <FluentInfoBar v-if="searchError && !busy" severity="error" :title="t('searchFailed')">
      <template #default>{{ searchError }}</template>
    </FluentInfoBar>

    <div v-if="lastMeta" class="result-toolbar">
      <div class="meta-line mono">
        {{ t('hashCount') }}: {{ lastMeta.hash_count }} · {{ t('matched') }}: {{ occs.length }} {{ t('colAligned').toLowerCase() }}
        <template v-if="mergeResults"> · {{ t('mergedResults') }}: {{ displayRows.length }}</template>
      </div>
      <FluentToggleSwitch v-model="mergeResults" :label="t('mergeSameFiles')" @change="selected.clear()" />
    </div>

    <div class="table-wrap grow-area">
      <table class="result-table">
        <thead>
          <tr>
            <th style="width: 32px"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
            <th>#</th>
            <th>{{ t('colFile') }}</th>
            <th>{{ t('colOffset') }}</th>
            <th>{{ t('colSpan') }}</th>
            <th>{{ t('colAligned') }}</th>
            <th>{{ t('colRatio') }}</th>
            <th>{{ t('colDur') }}</th>
            <th>{{ t('indexName') }}</th>
            <th style="width: 112px">{{ t('colActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!displayRows.length">
            <td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 40px">
              <div v-if="busy" class="matching-state">
                <FluentProgressRing :size="24" />
                <span>{{ t('searching') }}</span>
              </div>
              <template v-else>{{ searched ? t('emptyResult') : t('noResult') }}</template>
            </td>
          </tr>
          <tr v-for="(o, i) in displayRows" :key="o._key" :class="{ selected: selected.has(i) }" @click="toggleRow(i)">
            <td><input type="checkbox" :checked="selected.has(i)" @click.stop="toggleRow(i)" /></td>
            <td class="mono">{{ i + 1 }}</td>
            <td>
              {{ o?.name }}
              <span v-if="mergeResults && o._matchCount > 1" class="merge-count">×{{ o._matchCount }}</span>
            </td>
            <td class="mono">{{ fmt(o?.offset_file) }}</td>
            <td class="mono">{{ fmt(o?.tq0 * frameSec) }}–{{ fmt(o?.tq1 * frameSec) }}</td>
            <td class="mono">{{ o?.aligned }}</td>
            <td class="mono">{{ Math.min(100, (o?.ratio || 0) * 100).toFixed(2) }}%</td>
            <td class="mono">{{ fmt(o?.file_duration) }}</td>
            <td>{{ (o?.index_name || selectedIndex) }}</td>
            <td @click.stop>
              <FluentButton variant="subtle" size="sm" icon-only :title="t('play')" @click="playOcc(o)"><Icon icon="fluent:play-24-regular" :width="14" /></FluentButton>
              <FluentButton variant="subtle" size="sm" icon-only :title="isFavorited(o) ? t('favRemove') : t('favorite')" @click="toggleFavorite(o)"><Icon :icon="isFavorited(o) ? 'fluent:star-24-filled' : 'fluent:star-24-regular'" :width="14" /></FluentButton>
              <FluentButton variant="subtle" size="sm" icon-only :title="t('reveal')" @click="reveal(o)"><Icon icon="fluent:folder-open-16-regular" :width="14" /></FluentButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="action-bar">
      <FluentButton variant="subtle" size="sm" @click="selectAll"><Icon icon="fluent:checkmark-circle-24-regular" :width="15" /> {{ t('selectAll') }}</FluentButton>
      <FluentButton variant="subtle" size="sm" @click="selected.clear()">{{ t('clearSel') }}</FluentButton>
      <FluentButton variant="subtle" size="sm" :disabled="!selected.size" @click="favoriteSelected"><Icon icon="fluent:star-add-24-regular" :width="15" /> {{ t('favorite') }}</FluentButton>
      <FluentButton variant="subtle" size="sm" :disabled="!selected.size" @click="exportSelected"><Icon icon="fluent:save-arrow-right-24-regular" :width="15" /> {{ t('exportSel') }}</FluentButton>
      <FluentButton variant="subtle" size="sm" :disabled="!occs.length" @click="exportAll"><Icon icon="fluent:library-24-regular" :width="15" /> {{ t('exportResult') }}</FluentButton>
    </div>
    </template>

    <!-- ============ 历史 ============ -->
    <template v-else>
      <div v-if="!historyList.length" class="empty">
        <FluentEmptyState icon="fluent:history-24-regular" :title="t('history')"
          :description="t('noHistory')" />
      </div>
      <div v-else class="table-wrap grow-area">
        <table class="result-table">
          <thead>
            <tr>
              <th>{{ t('histSample') }}</th>
              <th>{{ t('indexName') }}</th>
              <th>{{ t('histCount') }}</th>
              <th>时间</th>
              <th style="width: 160px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in historyList" :key="h.id">
              <td class="mono" style="max-width: 320px; overflow: hidden; text-overflow: ellipsis">{{ basename(h.sample) }}</td>
              <td>{{ h?.index_name }}{{ h?.segment ? ' / ' + h.segment : '' }}</td>
              <td class="mono">{{ h?.count }}</td>
              <td class="mono">{{ h?.time }}</td>
              <td>
                <FluentButton variant="subtle" size="sm" @click="loadHistory(h)">
                  <Icon icon="fluent:play-24-regular" :width="14" /> {{ t('loadHistory') }}
                </FluentButton>
                <FluentButton variant="subtle" size="sm" icon-only :title="t('deleteHistory')" @click="deleteHistory(h)">
                  <Icon icon="fluent:delete-24-regular" :width="14" />
                </FluentButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, toRefs } from 'vue'
import {
  FluentButton, FluentComboBox, FluentEmptyState, FluentInfoBar, FluentInput,
  FluentProgressRing, FluentSegmented, FluentToggleSwitch
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, audioUrl, pickFile, pickDir, tauri } from '../utils/api'
import { playTrack } from '../stores/player'
import { searchState, startSearch } from '../stores/search'
import { indexState, refreshIndexes } from '../stores/indexes'
import { backendState, startBackendPoll } from '../stores/backend'
import { pushToast } from '../components/ToastHost.vue'

const frameSec = 256 / 11025

const mode = ref('search')
const modeItems = computed(() => [
  { label: t('search'), value: 'search' },
  { label: t('history'), value: 'history' }
])
const historyList = ref([])
const favoriteIds = reactive(new Map())

function basename(p) {
  if (!p) return '-'
  const parts = String(p).split(/[\\/]/)
  return parts[parts.length - 1]
}

async function loadHistoryList() {
  try {
    historyList.value = await api.get('/api/history')
  } catch { /* 静默 */ }
}

async function loadHistory(h) {
  try {
    const data = await api.get(`/api/history/${h.id}`)
    const idxName = data.index_name || h.index_name
    occs.value = (data.occurrences || []).map((o) => ({ ...o, index_name: idxName, segment: h.segment || null }))
    lastMeta.value = { hash_count: data.hash_count || h.hash_count, occurrences: occs.value }
    searched.value = true
    selected.value.clear()
    mode.value = 'search'
    pushToast({ title: t('loadHistory'), body: basename(h.sample) })
  } catch (e) {
    pushToast({ title: t('loadHistory') + '?', body: e.message })
  }
}

async function deleteHistory(h) {
  try {
    await api.delete(`/api/history/${h.id}`)
    loadHistoryList()
  } catch (e) {
    pushToast({ title: t('deleteHistory') + '?', body: e.message })
  }
}

const indexItems = computed(() => {
  const items = []
  for (const idx of indexes.value) {
    if (idx.segments.length > 1) {
      idx.segments.forEach((s) => items.push({ label: `${idx.name} / ${s.name}`, value: `${idx.name}|${s.name}` }))
    } else {
      items.push({ label: idx.name, value: idx.name })
    }
  }
  return items
})
const indexes = computed(() => indexState.items)
const { selectedIndex, sample, fromS, toS, minAligned, minRatio, searchThreads, searchMemoryMb,
        mergeResults, occs, selected, lastMeta, searched, busy, error: searchError } = toRefs(searchState)
const backendUp = backendState; startBackendPoll()

const displayRows = computed(() => {
  if (!mergeResults.value) {
    return occs.value.map((o, i) => ({ ...o, _key: `result-${i}`, _members: [o], _matchCount: 1 }))
  }

  const groups = new Map()
  occs.value.forEach((o, i) => {
    const filename = String(o?.name || '').trim()
    const key = filename ? `name-${filename}` : `unnamed-${i}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ occurrence: o, index: i })
  })

  return [...groups.entries()].map(([key, entries]) => {
    const best = entries.reduce((current, candidate) => {
      const ratioDiff = Number(candidate.occurrence?.ratio || 0) - Number(current.occurrence?.ratio || 0)
      if (ratioDiff !== 0) return ratioDiff > 0 ? candidate : current
      const alignedDiff = Number(candidate.occurrence?.aligned || 0) - Number(current.occurrence?.aligned || 0)
      return alignedDiff > 0 ? candidate : current
    })
    return {
      ...best.occurrence,
      ratio: Math.max(...entries.map(({ occurrence }) => Number(occurrence?.ratio || 0))),
      _key: key,
      _members: entries.map(({ occurrence }) => occurrence),
      _matchCount: entries.length
    }
  })
})

function fmt(s) {
  if (s === undefined || s === null || isNaN(s)) return '-'
  const m = Math.floor(Math.abs(s) / 60)
  const sec = Math.abs(s) % 60
  return `${m}:${sec.toFixed(1).padStart(4, '0')}`
}

async function loadIndexes() {
  try {
    await refreshIndexes({ includeStats: false })
  } catch { /* 后端未就绪时静默 */ }
  if (!selectedIndex.value && indexItems.value.length) {
    selectedIndex.value = indexItems.value[0].value
  }
}

async function pickSample() {
  const f = await pickFile([{ name: '音频 / 视频', extensions: ['wav', 'mp3', 'flac', 'ogg', 'oga', 'opus', 'aac', 'm4a', 'mp4', 'wma', 'aiff', 'aif', 'mkv', 'mov', 'webm', 'avi'] }])
  if (f) sample.value = f
}

function splitIndex(val) {
  const [name, seg] = String(val).split('|')
  return { name, segment: seg || null }
}

async function doMatch() {
  if (!selectedIndex.value) {
    pushToast({ title: t('noIndex') })
    return
  }
  if (!sample.value) {
    pushToast({ title: t('sample') + '?' })
    return
  }
  try {
    // 不预检健康，直接发请求（后端可能在加载大索引，health 会被阻塞导致误判）
    const { name, segment } = splitIndex(selectedIndex.value)
    const body = {
      index_name: name,
      segment,
      sample: sample.value,
      from_s: fromS.value || 0,
      to_s: toS.value === '' ? null : Number(toS.value),
      min_aligned: minAligned.value || 8,
      min_ratio: minRatio.value === '' ? null : Number(minRatio.value) / 100,
      threads: Number(searchThreads.value) || 0,
      memory_mb: Number(searchMemoryMb.value) || 0
    }
    const r = await startSearch(body)
    backendUp.ready = true
  } catch (e) {
    const msg = String(e.message)
    if (msg.includes('Failed to fetch') || msg.includes('拒绝') || msg.includes('refused')) {
      backendUp.ready = false
      pushToast({ title: '后端服务未响应', body: '程序后端可能未启动或正在加载大型索引（需 30~60 秒），请稍后重试。若持续出现此问题，请重启程序。' })
    } else {
      pushToast({ title: '检索失败', body: msg })
    }
  } finally { /* shared store owns busy state */ }
}

function playOcc(o) {
  playTrack({
    title: o.name,
    subtitle: `${t('colOffset')} ${fmt(o?.offset_file)}`,
    src: audioUrl(o.path),
    startTime: o.offset_file
  })
}

async function toggleFavorite(o) {
  const key = favoriteKey(o)
  const id = favoriteIds.get(key)
  if (id) {
    try {
      await api.delete(`/api/favorites/${id}`)
      favoriteIds.delete(key)
      pushToast({ title: t('favRemove'), body: o.name })
    } catch (e) {
      pushToast({ title: t('favRemove') + '?', body: e.message })
    }
    return
  }
  try {
    const result = await api.post('/api/favorites', {
      name: o.name, path: o.path, index_name: o?.index_name || splitIndex(selectedIndex.value).name,
      offset: o.offset_file, span: o.span, aligned: o.aligned, ratio: o.ratio
    })
    if (!result?.ok || !result?.id) throw new Error('Backend did not confirm the favorite')
    favoriteIds.set(key, result.id)
    pushToast({ title: t('favAdded'), body: o.name })
  } catch (e) {
    pushToast({ title: t('favFailed'), body: e.message })
  }
}

async function favoriteSelected() {
  const list = [...selected.value].map((i) => displayRows.value[i]).filter(Boolean)
  for (const o of list) {
    if (!isFavorited(o)) await toggleFavorite(o)
  }
  selected.value.clear()
}

function favoriteKey(o) {
  const offset = o?.offset_file ?? o?.offset ?? ''
  return `${o?.path || ''}\u0000${offset}\u0000${o?.span ?? ''}`
}

function isFavorited(o) {
  return favoriteIds.has(favoriteKey(o))
}

async function loadFavoriteKeys() {
  try {
    const favorites = await api.get('/api/favorites')
    favoriteIds.clear()
    favorites.forEach((favorite) => favoriteIds.set(favoriteKey(favorite), favorite.id))
  } catch { /* 后端未就绪时静默 */ }
}

function reveal(o) {
  if (tauri.isTauri) {
    import('@tauri-apps/api/core').then(({ invoke }) => invoke('reveal_in_explorer', { path: o.path }))
  }
}

const allSelected = computed(() => displayRows.value.length > 0 && selected.value.size === displayRows.value.length)
function toggleAll() {
  if (allSelected.value) selected.value.clear()
  else displayRows.value.forEach((_, i) => selected.value.add(i))
}
function toggleRow(i) {
  if (selected.value.has(i)) selected.value.delete(i)
  else selected.value.add(i)
}
function selectAll() {
  displayRows.value.forEach((_, i) => selected.value.add(i))
}

async function exportSelected() {
  const list = [...selected.value]
    .map((i) => displayRows.value[i])
    .filter(Boolean)
    .flatMap((o) => o._members || [o])
  await doExport(list)
}

async function exportAll() {
  await doExport(occs.value)
}

async function doExport(list) {
  if (!list.length) return
  const out = await pickDir()
  if (!out) return
  try {
    const { name, segment } = splitIndex(selectedIndex.value)
    // 同一源文件只需导出一次（去重 by file_id）
    const seen = new Set()
    const unique = list.filter((o) => {
      const key = o.file_id || o.path
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    await api.post('/api/export', {
      index_name: name, segment, out_dir: out,
      occurrences: unique.map((o) => ({
        file_id: o.file_id, path: o.path,
        offset_file: o.offset_file, span: o.span,
        tq0: o.tq0, tq1: o.tq1, aligned: o.aligned, ratio: o.ratio
      }))
    })
    pushToast({ title: t('exportDone'), body: out })
  } catch (e) {
    pushToast({ title: t('exportDone') + '?', body: e.message })
  }
}

onMounted(() => {
  loadHistoryList()
  loadFavoriteKeys()
  startBackendPoll()
  // 后端就绪后加载索引（带延迟重试）
  const tryLoad = async (retries) => {
    for (let i = 0; i < retries; i++) {
      if (backendUp.ready) {
        loadIndexes()
        return
      }
      if (i < retries - 1) await new Promise(r => setTimeout(r, 3000))
    }
  }
  tryLoad(5)
})
</script>

<style scoped>
.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}
.meta-line { font-size: 12px; color: var(--text-secondary); }
.merge-count { margin-left: 5px; color: var(--text-secondary); font-size: 11px; }
.matching-state { display: inline-flex; align-items: center; gap: 10px; }
.match-button :deep(.progress-ring-indeterminate) { stroke: currentColor; }
.two-option-segmented { margin-bottom: 14px; }
.two-option-segmented :deep(.segmented-items) { overflow: hidden; }
.two-option-segmented :deep(.segmented-indicator) { width: calc(50% - 2px) !important; }
.table-wrap {
  overflow: auto;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-card-solid, #fff);
}
.action-bar {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
</style>
