<template>
  <div class="page page-scroll">
    <h1 class="page-title">{{ t('manageTitle') }}</h1>

    <div class="action-bar">
      <FluentButton @click="importOpen = true">
        <Icon icon="fluent:arrow-import-24-regular" :width="16" /> {{ t('importIndex') }}
      </FluentButton>
      <FluentButton variant="secondary" :disabled="indexState.refreshing" @click="loadIndexes(true)"><Icon icon="fluent:arrow-counterclockwise-24-regular" :width="16" /> {{ t('refresh') }}</FluentButton>
    </div>

    <div v-if="indexState.loaded && !indexes.length" class="empty grow-area">
      <FluentEmptyState icon="fluent:library-24-regular" :title="t('manageEmpty')"
        :description="t('noIndex')" />
    </div>

    <div class="cards">
      <div v-for="idx in indexes" :key="idx.name" class="idx-card">
        <div class="idx-head">
          <div>
            <div class="idx-name">{{ idx?.name }}</div>
            <div class="idx-path mono">{{ idx?.path }}</div>
          </div>
          <FluentButton variant="subtle" size="sm" icon-only :title="t('delete')" @click="remove(idx)">
            <Icon icon="fluent:delete-24-regular" :width="15" />
          </FluentButton>
        </div>
        <div class="idx-stats">
          <span><b>{{ (idx?.segments?.length || 0) }}</b> {{ t('segments') }}</span>
          <span><b class="mono">{{ fmtCount(idx?.total_hashes) }}</b> {{ t('hashes') }}</span>
          <span><b class="mono">{{ fmtSize((idx?.segments || []).reduce((s, x) => s + (x?.size || 0), 0)) }}</b> {{ t('size') }}</span>
        </div>
        <div v-if="(idx?.segments?.length || 0) > 1" class="seg-list">
          <div v-for="s in idx.segments" :key="s.name" class="seg-row mono">
            {{ s.name }} · {{ s.files }} {{ t('files') }} · {{ fmtCount(s.hashes) }} {{ t('hashes') }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="indexState.refreshing && indexes.length" class="refresh-note">{{ t('refreshingStats') }}</div>

    <FluentModal v-model="importOpen" :title="t('importIndex')">
      <div class="form-row">
        <FluentInput v-model="impName" :label="t('importName')" style="width: 180px" />
        <FluentInput class="grow" :model-value="impPath" :label="t('importPath')" readonly />
        <FluentButton variant="secondary" icon-only :title="t('browse')" @click="pickImportPath"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
      </div>
      <p class="hint">{{ t('importHint') }}</p>
      <template #footer>
        <FluentButton :disabled="!impName || !impPath" @click="doImport">
          {{ t('importBtn') }}
        </FluentButton>
        <FluentButton variant="secondary" @click="importOpen = false">{{ t('cancel') }}</FluentButton>
      </template>
    </FluentModal>

    <FluentContentDialog
      v-model="delOpen"
      :title="t('deleteConfirm')"
      :primary-button-text="t('delete')"
      :secondary-button-text="t('cancel')"
      @primary-click="doDelete"
    >
      <FluentCheckBox v-model="delFiles" :label="t('deleteFiles')" />
      <div class="mono" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px">
        {{ delTarget?.name }} · {{ delTarget?.path }}
      </div>
    </FluentContentDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  FluentButton, FluentCheckBox, FluentContentDialog, FluentEmptyState,
  FluentInput, FluentModal
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, pickDir } from '../utils/api'
import { pushToast } from '../components/ToastHost.vue'
import { indexState, refreshIndexes } from '../stores/indexes'

const indexes = computed(() => indexState.items)
const importOpen = ref(false)
const impName = ref('')
const impPath = ref('')
const delOpen = ref(false)
const delFiles = ref(false)
const delTarget = ref(null)

function fmtCount(n) {
  if (n === null || n === undefined) return '—'
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万'
  return String(n)
}
function fmtSize(n) {
  if (n === null || n === undefined) return '—'
  if (n >= 1 << 30) return (n / (1 << 30)).toFixed(2) + ' GB'
  if (n >= 1 << 20) return (n / (1 << 20)).toFixed(1) + ' MB'
  return (n / 1024).toFixed(0) + ' KB'
}

async function loadIndexes(force = false) {
  try {
    if (!indexState.loaded) await refreshIndexes({ includeStats: false })
    await refreshIndexes({ includeStats: true, refreshStats: force, force })
  } catch (e) {
    pushToast({ title: t('manageTitle') + '?', body: e.message })
  }
}

async function pickImportPath() {
  const d = await pickDir()
  if (d) impPath.value = d
}

async function doImport() {
  try {
    await api.post('/api/indexes/import', { name: impName.value, path: impPath.value })
    pushToast({ title: t('importBtn'), body: impName.value })
    importOpen.value = false
    impName.value = ''
    impPath.value = ''
    await loadIndexes(true)
  } catch (e) {
    pushToast({ title: t('importBtn') + '?', body: e.message })
  }
}

function remove(idx) {
  delTarget.value = idx
  delOpen.value = true
}

async function doDelete() {
  try {
    await api.delete(`/api/indexes/${encodeURIComponent(delTarget.value.name)}?delete_files=${delFiles.value}`)
    pushToast({ title: t('delete'), body: delTarget.value.name })
    await loadIndexes(true)
  } catch (e) {
    pushToast({ title: t('delete') + '?', body: e.message })
  }
  delOpen.value = false
}

onMounted(loadIndexes)
</script>

<style scoped>
.action-bar { display: flex; gap: 8px; margin: 0 0 16px; flex-wrap: wrap; }
.cards { display: flex; flex-direction: column; gap: 12px; }
.idx-card {
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-card-solid, #fff);
}
.idx-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.idx-name { font-size: 15px; font-weight: 600; }
.idx-path { font-size: 12px; color: var(--text-secondary); margin-top: 2px; word-break: break-all; }
.idx-stats { display: flex; gap: 24px; margin-top: 10px; font-size: 13px; color: var(--text-secondary); flex-wrap: wrap; }
.idx-stats b { color: var(--text-primary); }
.seg-list {
  margin-top: 8px;
  max-height: 120px;
  overflow-y: auto;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hint { font-size: 12px; color: var(--text-secondary); }
.refresh-note { margin-top: 10px; color: var(--text-secondary); font-size: 12px; }
</style>
