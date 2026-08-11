<template>
  <div>
    <h1 class="page-title">{{ t('search') }}</h1>

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

    <FluentInfoBar v-if="!indexes.length && !busy" severity="warning" :title="t('noIndex')" />

    <div v-if="lastMeta" class="meta-line mono">
      {{ t('hashCount') }}: {{ lastMeta.hash_count }} · {{ t('matched') }}: {{ occs.length }} {{ t('colAligned').toLowerCase() }}
    </div>

    <div class="table-wrap">
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
            <th style="width: 220px">{{ t('search') }}操作</th>
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
            <td>{{ o.name }}</td>
            <td class="mono">{{ fmt(o.offset_file) }}</td>
            <td class="mono">{{ fmt(o.tq0 * frameSec) }}–{{ fmt(o.tq1 * frameSec) }}</td>
            <td class="mono">{{ o.aligned }}</td>
            <td class="mono">{{ (o.ratio * 100).toFixed(2) }}%</td>
            <td class="mono">{{ fmt(o.file_duration) }}</td>
            <td>{{ o.index_name || selectedIndex }}</td>
            <td @click.stop>
              <FluentButton compact @click="playOcc(o)"><Icon icon="fluent:play-24-regular" :width="14" /></FluentButton>
              <FluentButton compact @click="favoriteOcc(o)"><Icon icon="fluent:star-24-regular" :width="14" /></FluentButton>
              <FluentButton compact @click="reveal(o)"><Icon icon="fluent:folder-open-16-regular" :width="14" /></FluentButton>
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
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  FluentButton, FluentComboBox, FluentInfoBar, FluentInput
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, audioUrl, pickFile, pickDir, savePath, tauri } from '../utils/api'
import { playTrack } from '../stores/player'
import { pushToast } from '../components/ToastHost.vue'

const frameSec = 256 / 11025

const indexes = ref([])
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
const selectedIndex = ref('')
const sample = ref('')
const fromS = ref(0)
const toS = ref('')
const minAligned = ref(8)
const minRatio = ref('')
const busy = ref(false)
const searched = ref(false)
const lastMeta = ref(null)

const occs = ref([])
const selected = reactive(new Set())

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
    selected.clear()
    searched.value = true
  } catch (e) {
    pushToast({ title: t('searching'), body: e.message })
  } finally {
    busy.value = false
  }
}

function playOcc(o) {
  playTrack({
    title: o.name,
    subtitle: `${t('colOffset')} ${fmt(o.offset_file)}`,
    src: audioUrl(o.path, o.offset_file, Math.max(o.span, 3))
  })
}

async function favoriteOcc(o) {
  try {
    await api.post('/api/favorites', {
      name: o.name, path: o.path, index_name: o.index_name || selectedIndex.value,
      offset: o.offset_file, span: o.span, aligned: o.aligned, ratio: o.ratio
    })
    pushToast({ title: t('favAdded'), body: o.name })
  } catch (e) {
    pushToast({ title: t('favAdded') + '?', body: e.message })
  }
}

async function favoriteSelected() {
  const list = [...selected].map((i) => occs.value[i]).filter(Boolean)
  for (const o of list) await favoriteOcc(o)
  selected.clear()
}

function reveal(o) {
  if (tauri.isTauri) {
    import('@tauri-apps/api/core').then(({ invoke }) => invoke('reveal_in_explorer', { path: o.path }))
  }
}

const allSelected = computed(() => occs.value.length > 0 && selected.size === occs.value.length)
function toggleAll() {
  if (allSelected.value) selected.clear()
  else occs.value.forEach((_, i) => selected.add(i))
}
function toggleRow(i) {
  if (selected.has(i)) selected.delete(i)
  else selected.add(i)
}
function selectAll() {
  occs.value.forEach((_, i) => selected.add(i))
}

async function exportSelected() {
  await doExport([...selected].map((i) => occs.value[i]).filter(Boolean))
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

onMounted(loadIndexes)
</script>

<style scoped>
.meta-line { margin-bottom: 8px; font-size: 12px; color: var(--text-secondary); }
.table-wrap {
  overflow: auto;
  max-height: calc(100vh - 330px);
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
