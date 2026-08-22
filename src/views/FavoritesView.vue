<template>
  <div class="page">
    <h1 class="page-title">{{ t('favTitle') }}</h1>

    <div v-if="loaded && !favorites.length" class="empty grow-area">
      <FluentEmptyState icon="fluent:star-24-regular" :title="t('favEmpty')" />
    </div>

    <div v-else-if="favorites.length" class="table-wrap grow-area">
      <table class="result-table">
        <thead>
          <tr>
            <th style="width: 32px"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
            <th>{{ t('colFile') }}</th>
            <th>{{ t('indexName') }}</th>
            <th>{{ t('colOffset') }}</th>
            <th>{{ t('colSpan') }}</th>
            <th>{{ t('colRatio') }}</th>
            <th>收藏时间</th>
            <th class="actions-column">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in favorites" :key="f.id" :class="{ selected: selected.has(i) }" @click="toggleRow(i)">
            <td><input type="checkbox" :checked="selected.has(i)" @click.stop="toggleRow(i)" /></td>
            <td>{{ f?.name }}</td>
            <td>{{ f?.index_name }}</td>
            <td class="mono">{{ fmt(f?.offset) }}</td>
            <td class="mono">{{ fmt(f?.span) }}</td>
            <td class="mono">{{ Math.min(100, (f?.ratio || 0) * 100).toFixed(2) }}%</td>
            <td class="mono">{{ f?.added_at }}</td>
            <td @click.stop>
              <FluentButton variant="subtle" size="sm" icon-only :title="t('play')" @click="play(f)"><Icon icon="fluent:play-24-regular" :width="14" /></FluentButton>
              <FluentButton variant="subtle" size="sm" icon-only :title="t('favExport')" @click="exportOne(f)"><Icon icon="fluent:save-arrow-right-24-regular" :width="14" /></FluentButton>
              <FluentButton variant="subtle" size="sm" icon-only :title="t('favRemove')" @click="remove(f)"><Icon icon="fluent:star-off-24-regular" :width="14" /></FluentButton>
              <FluentButton variant="subtle" size="sm" icon-only :title="t('reveal')" @click="reveal(f)"><Icon icon="fluent:folder-open-16-regular" :width="14" /></FluentButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="favorites.length" class="action-bar">
      <FluentButton variant="subtle" size="sm" :disabled="!selected.size" @click="exportSelected">
        <Icon icon="fluent:save-arrow-right-24-regular" :width="15" /> {{ t('favExport') }} ({{ selected.size }})
      </FluentButton>
      <FluentButton variant="subtle" size="sm" :disabled="!selected.size" @click="removeSelected">
        <Icon icon="fluent:star-off-24-regular" :width="15" /> {{ t('favRemove') }}
      </FluentButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { FluentButton, FluentEmptyState } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, audioUrl, pickDir, tauri } from '../utils/api'
import { playTrack } from '../stores/player'
import { pushToast } from '../components/ToastHost.vue'

const favorites = ref([])
const loaded = ref(false)
const selected = reactive(new Set())

function fmt(s) {
  if (s === undefined || s === null || isNaN(s)) return '-'
  const m = Math.floor(Math.abs(s) / 60)
  const sec = Math.abs(s) % 60
  return `${m}:${sec.toFixed(1).padStart(4, '0')}`
}

async function load() {
  try {
    favorites.value = await api.get('/api/favorites')
  } catch { /* 后端未就绪时静默 */ }
  loaded.value = true
  selected.clear()
}

function play(f) {
  playTrack({
    title: f.name,
    subtitle: `${f.index_name} · ${t('colOffset')} ${fmt(f?.offset)}`,
    src: audioUrl(f.path),
    startTime: f.offset
  })
}

async function remove(f) {
  await api.delete(`/api/favorites/${f.id}`)
  load()
}

async function removeSelected() {
  for (const i of [...selected]) {
    await api.delete(`/api/favorites/${favorites.value[i].id}`)
  }
  load()
}

async function exportOne(f) {
  await doExport([f])
}

async function exportSelected() {
  const list = [...selected].map((i) => favorites.value[i]).filter(Boolean)
  await doExport(list)
}

async function doExport(list) {
  if (!list.length) return
  const out = await pickDir()
  if (!out) return
  try {
    await api.post('/api/export', {
      index_name: list[0].index_name, out_dir: out,
      occurrences: list.map((f) => ({
        path: f.path,
        offset_file: f.offset, span: f.span, tq0: 0, tq1: 0
      }))
    })
    pushToast({ title: t('exportDone'), body: out })
  } catch (e) {
    pushToast({ title: t('exportDone') + '?', body: e.message })
  }
}

function reveal(f) {
  if (tauri.isTauri) {
    import('@tauri-apps/api/core').then(({ invoke }) => invoke('reveal_in_explorer', { path: f.path }))
  }
}

const allSelected = computed(() => favorites.value.length > 0 && selected.size === favorites.value.length)
function toggleAll() {
  if (allSelected.value) selected.clear()
  else favorites.value.forEach((_, i) => selected.add(i))
}
function toggleRow(i) {
  if (selected.has(i)) selected.delete(i)
  else selected.add(i)
}

onMounted(load)
</script>

<style scoped>
.table-wrap {
  overflow: auto;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-card-solid, #fff);
}
.action-bar { display: flex; gap: 8px; margin-top: 12px; }
.actions-column { width: 132px; }
</style>
