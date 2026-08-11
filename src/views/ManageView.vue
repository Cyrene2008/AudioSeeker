<template>
  <div>
    <h1 class="page-title">{{ t('manageTitle') }}</h1>

    <div class="action-bar">
      <FluentButton appearance="accent" @click="importOpen = true">
        <Icon icon="fluent:import-24-regular" :width="16" /> {{ t('importIndex') }}
      </FluentButton>
      <FluentButton @click="loadIndexes"><Icon icon="fluent:arrow-counterclockwise-24-regular" :width="16" /> {{ t('refresh') }}</FluentButton>
    </div>

    <div v-if="!indexes.length" class="empty">
      <FluentEmptyState icon="fluent:library-24-regular" :title="t('manageEmpty')"
        :description="t('noIndex')" />
    </div>

    <div class="cards">
      <div v-for="idx in indexes" :key="idx.name" class="idx-card">
        <div class="idx-head">
          <div>
            <div class="idx-name">{{ idx.name }}</div>
            <div class="idx-path mono">{{ idx.path }}</div>
          </div>
          <FluentButton compact appearance="accent" @click="remove(idx)">
            <Icon icon="fluent:delete-24-regular" :width="15" />
          </FluentButton>
        </div>
        <div class="idx-stats">
          <span><b>{{ idx.segments.length }}</b> {{ t('segments') }}</span>
          <span><b class="mono">{{ fmtCount(idx.total_hashes) }}</b> {{ t('hashes') }}</span>
          <span><b class="mono">{{ fmtSize(idx.segments.reduce((s, x) => s + x.size, 0)) }}</b> {{ t('size') }}</span>
        </div>
        <div v-if="idx.segments.length > 1" class="seg-list">
          <div v-for="s in idx.segments" :key="s.name" class="seg-row mono">
            {{ s.name }} · {{ s.files }} {{ t('files') }} · {{ fmtCount(s.hashes) }} {{ t('hashes') }}
          </div>
        </div>
      </div>
    </div>

    <FluentModal v-model="importOpen" :title="t('importIndex')">
      <div class="form-row">
        <FluentInput v-model="impName" :label="t('importName')" style="width: 180px" />
        <FluentInput class="grow" :model-value="impPath" :label="t('importPath')" readonly />
        <FluentButton @click="pickImportPath"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
      </div>
      <p class="hint">{{ t('importHint') }}</p>
      <template #footer>
        <FluentButton appearance="accent" :disabled="!impName || !impPath" @click="doImport">
          {{ t('importBtn') }}
        </FluentButton>
        <FluentButton @click="importOpen = false">{{ t('cancel') }}</FluentButton>
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
import { onMounted, ref } from 'vue'
import {
  FluentButton, FluentCheckBox, FluentContentDialog, FluentEmptyState,
  FluentInput, FluentModal
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, pickDir } from '../utils/api'
import { pushToast } from '../components/ToastHost.vue'

const indexes = ref([])
const importOpen = ref(false)
const impName = ref('')
const impPath = ref('')
const delOpen = ref(false)
const delFiles = ref(false)
const delTarget = ref(null)

function fmtCount(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万'
  return String(n)
}
function fmtSize(n) {
  if (n >= 1 << 30) return (n / (1 << 30)).toFixed(2) + ' GB'
  if (n >= 1 << 20) return (n / (1 << 20)).toFixed(1) + ' MB'
  return (n / 1024).toFixed(0) + ' KB'
}

async function loadIndexes() {
  try {
    indexes.value = await api.get('/api/indexes')
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
    loadIndexes()
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
    loadIndexes()
  } catch (e) {
    pushToast({ title: t('delete') + '?', body: e.message })
  }
  delOpen.value = false
}

onMounted(loadIndexes)
</script>

<style scoped>
.action-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.cards { display: flex; flex-direction: column; gap: 12px; }
.idx-card {
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-card-solid, #fff);
}
.idx-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.idx-name { font-size: 15px; font-weight: 600; }
.idx-path { font-size: 12px; color: var(--text-secondary); margin-top: 2px; word-break: break-all; }
.idx-stats { display: flex; gap: 24px; margin-top: 10px; font-size: 13px; color: var(--text-secondary); }
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
.empty { margin-top: 60px; }
.hint { font-size: 12px; color: var(--text-secondary); }
</style>
