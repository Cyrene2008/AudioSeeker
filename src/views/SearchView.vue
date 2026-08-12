<template>
  <div class="page">
    <h1 class="page-title">{{ t('search') }}</h1>

    <FluentSegmented :model-value="mode" :items="modeItems" @update:model-value="mode = $event" style="margin-bottom: 14px" />

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
      <FluentInput class="grow" :model-value="sample" :label="t('sample')" placeholder="*.wav / *.mp3 / *.flac…" readonly />
      <FluentButton @click="pickSample"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
    </div>

    <div class="form-row">
      <FluentInput v-model.number="fromS" type="number" :label="t('fromSec')" :min="0" />
      <FluentInput v-model.number="toS" type="number" :label="t('toSec')" :placeholder="t('toEnd')" :min="0" />
      <FluentInput v-model.number="minAligned" type="number" :label="t('minAligned')" :min="1" />
      <FluentInput v-model.number="minRatio" type="number" :label="t('minRatio')" :placeholder="t('autoRatio')" :min="0" />
      <FluentButton :appearance="'accent'" :disabled="busy" @click="doMatch">
        {{ busy ? t('matching') : t('startMatch') }}
      </FluentButton>
    </div>

    <FluentInfoBar v-if="!indexes.length && !busy && backendUp.ready" severity="warning" :title="t('noIndex')" />
    <FluentInfoBar v-if="!backendUp.ready && !busy" severity="warning" title="正在连接后端…" style="margin-top:6px">
      <template #default>首次启动需等待后端初始化（加载索引通常需要 10~30 秒），完成后此提示会自动消失。</template>
    </FluentInfoBar>

    <div v-if="lastMeta" class="meta-line mono">
      {{ t('hashCount') }}: {{ lastMeta.hash_count }} · {{ t('matched') }}: {{ occs.length }} {{ t('colAligned').toLowerCase() }}
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
            <th style="width: 220px">{{ t('colActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!occs.length">
            <td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 40px">
              {{ busy ? t('searching') : (searched ? t('emptyResult') : t('noResult')) }}
            </td>
          </tr>
          <tr v-for="(o, i) in occs" :key="i" :class="{ selected: selected.has(i) }" @click="toggleRow(i)">
            <td><input type="checkbox" :checked="selected.has(i)" @click.stop="toggleRow(i)" /></td>
            <td class="mono">{{ i + 1 }}</td>
            <td>{{ o?.name }}</td>
            <td class="mono">{{ fmt(o?.offset_file) }}</td>
            <td class="mono">{{ fmt(o?.tq0 * frameSec) }}–{{ fmt(o?.tq1 * frameSec) }}</td>
            <td class="mono">{{ o?.aligned }}</td>
            <td class="mono">{{ Math.min(100, (o?.ratio || 0) * 100).toFixed(2) }}%</td>
            <td class="mono">{{ fmt(o?.file_duration) }}</td>
            <td>{{ (o?.index_name || selectedIndex) }}</td>
            <td @click.stop>
              <FluentButton compact appearance="subtle" @click="playOcc(o)"><Icon icon="fluent:play-24-regular" :width="14" /></FluentButton>
              <FluentButton compact appearance="subtle" @click="favoriteOcc(o)"><Icon icon="fluent:star-24-regular" :width="14" /></FluentButton>
              <FluentButton compact appearance="subtle" @click="reveal(o)"><Icon icon="fluent:folder-open-16-regular" :width="14" /></FluentButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="action-bar">
      <FluentButton compact @click="selectAll"><Icon icon="fluent:checkmark-circle-24-regular" :width="15" /> {{ t('selectAll') }}</FluentButton>
      <FluentButton compact @click="selected.clear()">{{ t('clearSel') }}</FluentButton>
      <FluentButton compact :disabled="!selected.size" @click="favoriteSelected"><Icon icon="fluent:star-add-24-regular" :width="15" /> {{ t('favorite') }}</FluentButton>
      <FluentButton compact :disabled="!selected.size" @click="exportSelected"><Icon icon="fluent:save-arrow-right-24-regular" :width="15" /> {{ t('exportSel') }}</FluentButton>
      <FluentButton compact :disabled="!occs.length" @click="exportAll"><Icon icon="fluent:library-24-regular" :width="15" /> {{ t('exportResult') }}</FluentButton>
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
                <FluentButton compact appearance="subtle" @click="loadHistory(h)">
                  <Icon icon="fluent:play-24-regular" :width="14" /> {{ t('loadHistory') }}
                </FluentButton>
                <FluentButton compact appearance="subtle" @click="deleteHistory(h)">
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
import { computed, onMounted, ref, toRefs } from 'vue'
import {
  FluentButton, FluentComboBox, FluentEmptyState, FluentInfoBar, FluentInput, FluentSegmented
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, audioUrl, pickFile, savePath, tauri, checkHealth } from '../utils/api'
import { playTrack } from '../stores/player'
import { searchState } from '../stores/search'
import { backendState, startBackendPoll } from '../stores/backend'
import { pushToast } from '../components/ToastHost.vue'

const frameSec = 256 / 11025

const mode = ref('search')
const modeItems = computed(() => [
  { label: t('search'), value: 'search' },
  { label: t('history'), value: 'history' }
])
const historyList = ref([])

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
const { indexes, selectedIndex, sample, fromS, toS, minAligned, minRatio,
        occs, selected, lastMeta, searched } = toRefs(searchState)
const busy = ref(false)
const backendUp = backendState; startBackendPoll()

function fmt(s) {
  if (s === undefined || s === null || isNaN(s)) return '-'
  const m = Math.floor(Math.abs(s) / 60)
  const sec = Math.abs(s) % 60
  return `${m}:${sec.toFixed(1).padStart(4, '0')}`
}

async function loadIndexes() {
  try {
    indexes.value = await api.get('/api/indexes')
  } catch { /* 后端未就绪时静默 */ }
  if (!selectedIndex.value && indexItems.value.length) {
    selectedIndex.value = indexItems.value[0].value
  }
}

async function pickSample() {
  const f = await pickFile([{ name: '音频', extensions: ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'wma'] }])
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
  busy.value = true
  try {
    const ok = await checkHealth()
    backendUp.ready = ok
    if (!ok) {
      pushToast({ title: '后端服务未就绪', body: '请检查后端是否启动，或稍后重试' })
      busy.value = false
      return
    }
    const { name, segment } = splitIndex(selectedIndex.value)
    const body = {
      index_name: name,
      segment,
      sample: sample.value,
      from_s: fromS.value || 0,
      to_s: toS.value === '' ? null : Number(toS.value),
      min_aligned: minAligned.value || 8,
      min_ratio: minRatio.value === '' ? null : Number(minRatio.value) / 100
    }
    const r = await api.post('/api/match', body)
    lastMeta.value = r
    occs.value = (r.occurrences || []).map((o) => ({ ...o, index_name: name, segment }))
    selected.value.clear()
    searched.value = true
  } catch (e) {
    const msg = String(e.message)
    if (msg.includes('Failed to fetch') || msg.includes('拒绝') || msg.includes('refused')) {
      backendUp.ready = false
      pushToast({ title: '后端服务未响应', body: '程序后端可能未启动或已崩溃，请重启程序。若持续出现此问题，检查是否有端口占用。' })
    } else {
      pushToast({ title: '检索失败', body: msg })
    }
  } finally {
    busy.value = false
  }
}

function playOcc(o) {
  playTrack({
    title: o.name,
    subtitle: `${t('colOffset')} ${fmt(o?.offset_file)}`,
    src: audioUrl(o.path, o.offset_file, Math.max(o.span, 3))
  })
}

async function favoriteOcc(o) {
  try {
    await api.post('/api/favorites', {
      name: o.name, path: o.path, index_name: (o?.index_name || selectedIndex).value,
      offset: o.offset_file, span: o.span, aligned: o.aligned, ratio: o.ratio
    })
    pushToast({ title: t('favAdded'), body: o.name })
  } catch (e) {
    pushToast({ title: t('favAdded') + '?', body: e.message })
  }
}

async function favoriteSelected() {
  const list = [...selected.value].map((i) => occs.value[i]).filter(Boolean)
  for (const o of list) await favoriteOcc(o)
  selected.value.clear()
}

function reveal(o) {
  if (tauri.isTauri) {
    import('@tauri-apps/api/core').then(({ invoke }) => invoke('reveal_in_explorer', { path: o.path }))
  }
}

const allSelected = computed(() => occs.value.length > 0 && selected.value.size === occs.value.length)
function toggleAll() {
  if (allSelected.value) selected.value.clear()
  else occs.value.forEach((_, i) => selected.value.add(i))
}
function toggleRow(i) {
  if (selected.value.has(i)) selected.value.delete(i)
  else selected.value.add(i)
}
function selectAll() {
  occs.value.forEach((_, i) => selected.value.add(i))
}

async function exportSelected() {
  await doExport([...selected.value].map((i) => occs.value[i]).filter(Boolean))
}

async function exportAll() {
  await doExport(occs.value)
}

async function doExport(list) {
  if (!list.length) return
  const out = await savePath('export.wav', [{ name: 'WAV', extensions: ['wav'] }])
  if (!out) return
  try {
    const { name, segment } = splitIndex(selectedIndex.value)
    await api.post('/api/export', {
      index_name: name, segment, out_path: out,
      occurrences: list.map((o) => ({
        file_id: o.file_id, offset_file: o.offset_file, span: o.span,
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
.meta-line { margin-bottom: 8px; font-size: 12px; color: var(--text-secondary); }
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
