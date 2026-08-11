<template>
  <div>
    <h1 class="page-title">{{ t('build') }}</h1>

    <FluentSegmented v-model="mode" :items="modeItems" />

    <!-- 新建 -->
    <div v-if="mode === 'new'" class="card">
      <div class="form-row">
        <FluentInput class="grow" :model-value="srcDir" :label="t('srcDir')" readonly />
        <FluentButton @click="pickSrc"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
      </div>
      <div class="form-row">
        <FluentInput v-model="name" :label="t('indexName')" placeholder="my_index" style="width: 220px" />
        <FluentNumberBox v-model="threads" :label="t('threads')" :min="1" :max="64" style="width: 120px" />
        <FluentNumberBox v-model="ramGb" :label="t('ramGb')" :min="0" :max="256" style="width: 160px" />
        <FluentToggleSwitch v-model="recursive" :label="t('scanSub')" />
      </div>
      <div class="form-row">
        <FluentButton appearance="accent" :disabled="!canStart || jobRunning" @click="openWarn">
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
        <FluentButton @click="pickSrc"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
      </div>
      <div class="form-row">
        <FluentNumberBox v-model="threads" :label="t('threads')" :min="1" :max="64" style="width: 120px" />
        <FluentButton appearance="accent" :disabled="!canStartInc || jobRunning" @click="startIncremental">
          {{ t('buildStart') }}
        </FluentButton>
      </div>
    </div>

    <!-- 任务状态 -->
    <div v-if="job" class="card job-card">
      <h3>{{ t('jobInfo') }}</h3>
      <div class="job-row">
        <span>{{ t('indexName') }}: <b>{{ job.name }}</b></span>
        <span>{{ t('threads') }}: {{ job.threads }}</span>
        <span>{{ t('elapsed') }}: {{ fmt(job.elapsed) }}</span>
        <span v-if="job.total">{{ t('progress') }}: {{ job.processed }}/{{ job.total }}</span>
        <FluentButton v-if="job.running" compact appearance="accent" @click="cancelBuild">
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
        <FluentButton appearance="accent" @click="warnOpen = false; startNew()">{{ t('warnConfirm') }}</FluentButton>
        <FluentButton @click="warnOpen = false">{{ t('cancel') }}</FluentButton>
      </template>
    </FluentModal>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  FluentButton, FluentComboBox, FluentInfoBar, FluentInput,
  FluentModal, FluentNumberBox, FluentProgressBar, FluentSegmented, FluentToggleSwitch
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { api, pickDir } from '../utils/api'
import { pushToast } from '../components/ToastHost.vue'

const mode = ref('new')
const modeItems = computed(() => [
  { label: t('buildNew'), value: 'new' },
  { label: t('buildInc'), value: 'inc' }
])

const srcDir = ref('')
const name = ref('')
const threads = ref(8)
const ramGb = ref(0)
const recursive = ref(false)
const warnOpen = ref(false)

const indexes = ref([])
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
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

async function pickSrc() {
  const d = await pickDir()
  if (d) srcDir.value = d
}

async function loadIndexes() {
  try {
    indexes.value = await api.get('/api/indexes')
  } catch { /* 后端未就绪时静默 */ }
  if (!incIndex.value && incItems.value.length) incIndex.value = incItems.value[0].value
}

function openWarn() {
  warnOpen.value = true
}

async function startNew() {
  try {
    await api.post('/api/build/start', {
      name: name.value, src_dir: srcDir.value, threads: threads.value,
      ram_gb: ramGb.value, recursive: recursive.value, incremental: false
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
      ram_gb: 0, recursive: recursive.value, incremental: true
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
    job.value = await api.get('/api/build/status')
    if (job.value.log) jobLog.value = job.value.log
    const wasRunning = prev && prev.running
    if (job.value.running) {
      pollTimer = setTimeout(pollJob, 800)
    } else if (job.value.name) {
      // 仅在本次运行中由"进行中→完成"转变时提示一次，切页回来不再重复弹
      if (wasRunning) {
        pushToast({ title: t('buildDone'), body: job.value.name })
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
</script>

<style scoped>
.card {
  margin-top: 14px;
  padding: 18px;
  border-radius: 12px;
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
</style>
