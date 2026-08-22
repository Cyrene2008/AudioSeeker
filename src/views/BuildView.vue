<template>
  <div class="page page-scroll">
    <h1 class="page-title">{{ t('build') }}</h1>

    <FluentSegmented class="build-mode" v-model="mode" :items="modeItems" />

    <!-- 新建 -->
    <div v-if="mode === 'new'" class="card">
      <div class="form-row">
        <FluentInput class="grow" :model-value="srcDir" :label="t('srcDir')" readonly />
        <FluentButton variant="secondary" icon-only :title="t('browse')" @click="pickSrc"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field-label">{{ t('indexName') }}</label>
          <FluentInput v-model="name" placeholder="my_index" />
        </div>
        <div class="field">
          <label class="field-label">{{ t('threads') }}</label>
          <FluentNumberBox v-model="threads" :min="1" :max="64" />
        </div>
        <div class="field">
          <label class="field-label">{{ t('segmentSizeMb') }}</label>
          <FluentNumberBox v-model="newSegmentSizeMb" :min="0" :max="1048576" :step="64" />
          <div class="field-hint">{{ t('segmentSizeHint') }}</div>
        </div>
        <div class="field">
          <label class="field-label field-label-empty" />
          <FluentToggleSwitch v-model="recursive" :label="t('scanSub')" />
        </div>
      </div>
      <div class="form-row">
        <FluentButton :disabled="!canStart || jobRunning" @click="openWarn">
          {{ t('buildStart') }}
        </FluentButton>
      </div>
    </div>

    <!-- 增量 -->
    <div v-else class="card">
      <FluentInfoBar severity="info" :title="t('incrementalHint')" />
      <div class="form-row" style="margin-top: 12px">
        <FluentComboBox class="grow" :items="incItems" v-model="incIndex" :label="t('incIndex')" />
        <FluentInput class="grow" :model-value="srcDir" :label="t('srcDir')" readonly />
        <FluentButton variant="secondary" icon-only :title="t('browse')" @click="pickSrc"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field-label">{{ t('threads') }}</label>
          <FluentNumberBox v-model="threads" :min="1" :max="64" />
        </div>
        <div class="field">
          <label class="field-label">{{ t('segmentSizeMb') }}</label>
          <FluentNumberBox v-model="incSegmentSizeMb" :min="0" :max="1048576" :step="64" />
          <div class="field-hint">{{ t('segmentSizeHint') }}</div>
        </div>
        <div class="field">
          <label class="field-label field-label-empty" />
          <FluentToggleSwitch v-model="recursive" :label="t('scanSub')" />
        </div>
        <div class="field">
          <label class="field-label field-label-empty" />
          <FluentButton :disabled="!canStartInc || jobRunning" @click="startIncremental">
            {{ t('buildStart') }}
          </FluentButton>
        </div>
      </div>
    </div>

    <!-- 任务状态 -->
    <div v-if="job" class="card job-card">
      <h3>{{ t('jobInfo') }}</h3>
      <div class="job-row">
        <span>{{ t('indexName') }}: <b>{{ job.name }}</b></span>
        <span>{{ t('threads') }}: {{ job.threads }}</span>
        <span>{{ t('elapsed') }}: {{ fmt(job.elapsed) }}</span>
        <span v-if="job.total">{{ t('progress') }}: {{ job.processed }}/{{ job.total }}</span>        <FluentButton v-if="job.running" variant="secondary" size="sm" @click="cancelBuild">
          {{ t('buildCancel') }}
        </FluentButton>
      </div>
      <div class="progress-row">
        <FluentProgressBar :value="jobProcessed" :max="job.total || 1" style="flex: 1" />
        <span class="mono" style="font-size: 12px">{{ job.done }} ✓ / {{ job.failed }} ✗</span>
      </div>
      <div v-if="job.last" class="mono" style="font-size: 12px; color: var(--text-secondary)">
        {{ t('lastFile') }}: {{ job.last }}
      </div>
      <div class="log-box" v-html="logHtml" />
    </div>

    <!-- 扫描范围确认 Modal -->
    <FluentModal v-model="warnOpen" :title="t('warnTitle')">
      <p>{{ t('warnBody') }}</p>
      <template #footer>
        <FluentButton @click="warnOpen = false; startNew()">{{ t('warnConfirm') }}</FluentButton>
        <FluentButton variant="secondary" @click="warnOpen = false">{{ t('cancel') }}</FluentButton>
      </template>
    </FluentModal>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  FluentButton, FluentComboBox, FluentInfoBar, FluentInput,
  FluentModal, FluentNumberBox, FluentProgressBar, FluentSegmented, FluentToggleSwitch
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, pickDir } from '../utils/api'
import { pushToast } from '../components/ToastHost.vue'
import { indexState, refreshIndexes } from '../stores/indexes'

const mode = ref('new')
const modeItems = computed(() => [
  { label: t('buildNew'), value: 'new' },
  { label: t('buildInc'), value: 'inc' }
])

const srcDir = ref('')
const name = ref('')
const threads = ref(8)
const newSegmentSizeMb = ref(0)
const incSegmentSizeMb = ref(0)
const recursive = ref(false)
const warnOpen = ref(false)

const indexes = computed(() => indexState.items)
const incIndex = ref('')
const incItems = computed(() => indexes.value.map((i) => ({ label: i.name, value: i.name })))

const job = ref(null)
const jobRunning = computed(() => job.value?.running)
const jobProcessed = computed(() => job.value?.processed || 0)
const jobLog = ref('')
const logHtml = computed(() => escapeHtml(jobLog.value))
let pollTimer = null

const canStart = computed(() => srcDir.value && name.value && !jobRunning.value)
const canStartInc = computed(() => srcDir.value && incIndex.value && !jobRunning.value)

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmt(s) {
  const n = Number(s)
  if (!Number.isFinite(n) || n < 0) return '0:00'
  const m = Math.floor(n / 60)
  const sec = Math.round(n % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

async function pickSrc() {
  const d = await pickDir()
  if (d) srcDir.value = d
}

async function loadIndexes() {
  try {
    await refreshIndexes({ includeStats: false })
  } catch { /* 后端未就绪时静默 */ }
  if (!incIndex.value && incItems.value.length) incIndex.value = incItems.value[0].value
}

function openWarn() {
  if (recursive.value) startNew()
  else warnOpen.value = true
}

async function startNew() {
  try {
    await api.post('/api/build/start', {
      name: name.value, src_dir: srcDir.value, threads: threads.value,
      segment_size_mb: newSegmentSizeMb.value, recursive: recursive.value, incremental: false
    })
    pushToast({ title: t('building'), body: name.value })
    pollJob()
  } catch (e) {
    pushToast({ title: t('buildStart') + '?', body: e.message })
  }
}

async function startIncremental() {
  try {
    await api.post('/api/build/start', {
      name: incIndex.value, src_dir: srcDir.value, threads: threads.value,
      segment_size_mb: incSegmentSizeMb.value, recursive: recursive.value, incremental: true
    })
    pushToast({ title: t('building'), body: incIndex.value })
    pollJob()
  } catch (e) {
    pushToast({ title: t('buildStart') + '?', body: e.message })
  }
}

async function pollJob() {
  try {
    const prev = job.value
    const data = await api.get('/api/build/status')
    job.value = data && data.name ? data : null // 无任务时清爽隐藏
    if (data && data.log) jobLog.value = data.log
    const wasRunning = prev && prev.running
    if (data && data.running) {
      pollTimer = setTimeout(pollJob, 800)
    } else if (data && data.name) {
      // 仅在本次运行中由"进行中→完成"转变时提示一次，切页回来不再重复弹
      if (wasRunning) {
        pushToast({ title: t('buildDone'), body: data.name })
      }
      loadIndexes()
    }
  } catch { /* ignore */ }
}

async function cancelBuild() {
  await api.post('/api/build/cancel')
  pushToast({ title: t('buildCancel') })
}

onMounted(() => {
  loadIndexes()
  pollJob()
})
onUnmounted(() => clearTimeout(pollTimer))

watch(incIndex, (name) => {
  const index = indexes.value.find((item) => item.name === name)
  incSegmentSizeMb.value = index?.segment_size_mb ?? 0
})
</script>

<style scoped>
.card {
  margin-top: 14px;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-card-solid, #fff);
}
.job-card h3 { margin: 0 0 10px; font-size: 15px; }
.job-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 10px;
  font-size: 13px;
  flex-wrap: wrap;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.build-mode { margin-bottom: 14px; }
.job-card { margin-bottom: 2px; }
.job-card .mono { overflow-wrap: anywhere; }

/* 统一表单布局：label 固定顶部，行内对齐 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px 18px;
  margin: 16px 0 4px;
  align-items: start;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.field-label {
  font-size: 12px;
  color: var(--text-secondary, #6b3a55);
  line-height: 1.2;
  white-space: nowrap;
}
.field-label-empty { height: 14px; }
.field-hint {
  font-size: 11px;
  color: var(--text-tertiary, #9a7b8e);
  line-height: 1.4;
  max-width: 260px;
}
</style>
