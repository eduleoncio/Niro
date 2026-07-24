<template>
  <section class="timeline-page">

    <!-- ===== Access gates ===== -->
    <div v-if="!session" class="access-gate">
      <p class="eyebrow">Acesso restrito</p>
      <h2>Você precisa estar logado para ver esta página.</h2>
      <RouterLink class="btn btn--primary" to="/login">Ir para o login</RouterLink>
    </div>

    <template v-else>
      <!-- ===== Header ===== -->
      <header class="page-header">
        <div class="page-header__text">
          <p class="eyebrow">Linha do tempo · confirmação</p>
          <h1>Lançamentos da equipe</h1>
          <p class="page-subtitle">Todo início e fim de semana salvo por cada analista, mais recente primeiro.</p>
        </div>
      </header>

      <!-- ===== Equipe (cards) ===== -->
      <section class="team-section">
        <h2 class="team-section__title">Equipe</h2>
        <div class="team-grid">
          <article v-for="pessoa in teamRoster" :key="pessoa.email" class="team-card">
            <div class="team-card__avatar" :style="teamAvatarStyle(pessoa)">
              <span v-if="!pessoa.avatar_url">
                {{ initials(pessoa.name) }}
              </span>
            </div>
            <strong class="team-card__name">{{ pessoa.name }}</strong>
            <small class="team-card__role">{{ pessoa.role === 'gerencia' ? 'Gerência' : 'Confirmação' }}</small>
            <RouterLink class="btn btn--ghost team-card__btn" :to="`/equipe/${encodeURIComponent(pessoa.email)}`">
              Ver perfil
            </RouterLink>
          </article>
        </div>
      </section>

      <!-- ===== Filters ===== -->
      <section class="toolbar">
        <label class="field field--sm">
          <span>Funcionário</span>
          <select v-model="filterAnalyst" class="field__select">
            <option value="">Todos</option>
            <option v-for="a in analystOptions" :key="a" :value="a">{{ a }}</option>
          </select>
        </label>

        <label class="field field--sm">
          <span>Carteira</span>
          <select v-model="filterWallet" class="field__select">
            <option value="">Todas</option>
            <option v-for="w in walletOptionsInData" :key="w" :value="w">{{ w }}</option>
          </select>
        </label>

        <label class="field field--sm">
          <span>Tipo</span>
          <select v-model="filterType" class="field__select">
            <option value="">Início e fim</option>
            <option value="inicio">Só início</option>
            <option value="fim">Só fim</option>
          </select>
        </label>
      </section>

      <p v-if="loadError" class="error-banner">{{ loadError }}</p>
      <p v-if="!loading && filteredItems.length === 0" class="info-message">
        Nenhum lançamento encontrado com esses filtros.
      </p>

      <!-- ===== Timeline ===== -->
      <ol class="timeline">
        <li v-for="item in filteredItems" :key="item.id" class="timeline-item">
          <div class="timeline-item__marker" :class="`timeline-item__marker--${item.snapshot_type}`"></div>
          <article class="timeline-card">
            <header class="timeline-card__head">
              <div class="timeline-card__who">
                <span class="avatar avatar--initials">{{ initials(item.analyst_name) }}</span>
                <div>
                  <strong>{{ item.analyst_name }}</strong>
                  <small>salvou o <b>{{ item.snapshot_type === 'inicio' ? 'início' : 'fim' }} da semana</b> · carteira
                    {{ item.wallet }}</small>
                </div>
              </div>
              <div class="timeline-card__head-actions">
                <span class="tag" :class="item.snapshot_type === 'inicio' ? 'tag--steel' : 'tag--jade'">
                  {{ formatDate(item.captured_at) }}
                </span>
                <button type="button" class="btn-pdf" @click="baixarPdfItem(item)" title="Baixar relatório em PDF">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  PDF
                </button>
              </div>
            </header>

            <div class="timeline-card__body">
              <span class="chip">Total <strong>{{ formatCurrency(item.total) }}</strong></span>
              <span class="chip">FIDC <strong>{{ formatCurrency(item.fidcTotal) }}</strong></span>
              <span class="chip">Factor <strong>{{ formatCurrency(item.factorTotal) }}</strong></span>

              <span v-if="item.snapshot_type === 'fim' && item.delta !== null" class="chip"
                :class="item.delta <= 0 ? 'chip--good' : 'chip--bad'">
                Variação da semana <strong>{{ item.delta > 0 ? '+' : '' }}{{ formatCurrency(item.delta) }}</strong>
              </span>
            </div>
          </article>
        </li>
      </ol>

      <div class="pdf-render-area" aria-hidden="true">
        <PdfReport v-if="pdfReportData" id="pdf-report-export-historico" :report="pdfReportData" />
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useSupabase } from '../composables/useSupabase' // agora cuida de login E dados, mesmo projeto
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import PdfReport from '../components/PdfReport.vue'
import { buildPdfReport } from '../utils/pdf/reportBuilder'

const { session, supabase } = useSupabase()

/* ---------- Usuário atual ---------- */
const currentUserName = ref('')

async function carregarUsuarioAtual(email) {
  currentUserName.value = ''

  if (!email) return

  try {
    const { data, error } = await supabase
      .from('team_access')
      .select('name')
      .ilike('email', email.trim())
      .maybeSingle()

    if (error) throw error

    currentUserName.value = data?.name || ''
  } catch (error) {
    console.error('Erro ao carregar usuário atual:', error)
  }
}

watch(
  () => session.value?.user?.email,
  email => carregarUsuarioAtual(email),
  { immediate: true }
)

/* ---------- Dados ---------- */
const rawItems = ref([])
const loading = ref(true)
const loadError = ref('')
const pdfReportData = ref(null)

function sumObject(obj) {
  if (!obj) return 0
  return Object.values(obj).reduce((s, v) => s + Number(v || 0), 0)
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.split('-').reverse().join('/')
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

async function carregarLancamentos() {
  loading.value = true
  loadError.value = ''
  try {
    const { data, error } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    rawItems.value = data
  } catch (e) {
    console.error(e)
    loadError.value = 'Não foi possível carregar os lançamentos.'
  } finally {
    loading.value = false
  }
}

/* ---------- Equipe (cards) ---------- */
const teamRoster = ref([])

async function carregarEquipe() {
  try {
    const { data, error } = await supabase
      .from('team_access')
      .select('email, name, role, avatar_url')
      .order('name')

    if (error) throw error
    teamRoster.value = data
  } catch (e) {
    console.error(e)
  }
}

function avatarColor(email) {
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `linear-gradient(135deg, hsl(${hue}, 55%, 30%), hsl(${hue}, 55%, 18%))`
}

function teamAvatarStyle(pessoa) {
  if (pessoa?.avatar_url) {
    return {
      backgroundImage: `url("${pessoa.avatar_url}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }

  return {
    background: avatarColor(pessoa?.email || '')
  }
}

onMounted(() => {
  carregarLancamentos()
  carregarEquipe()
})

/* ---------- Enriquecimento (totais + variação do "fim" contra o "início" da mesma semana/carteira) ---------- */
const enrichedItems = computed(() => {
  const byWeekWallet = new Map()
  rawItems.value.forEach(item => {
    const key = `${item.week_start}__${item.wallet}`
    if (!byWeekWallet.has(key)) byWeekWallet.set(key, {})
    byWeekWallet.get(key)[item.snapshot_type] = item
  })

  return rawItems.value.map(item => {
    const fidcTotal = sumObject(item.fidc)
    const factorTotal = sumObject(item.factor)
    const total = fidcTotal + factorTotal

    let delta = null
    const pair = byWeekWallet.get(`${item.week_start}__${item.wallet}`)
    if (item.snapshot_type === 'fim' && pair?.inicio) {
      delta = total - (sumObject(pair.inicio.fidc) + sumObject(pair.inicio.factor))
    }

    return { ...item, fidcTotal, factorTotal, total, delta, pairInicio: pair?.inicio || null, pairFim: pair?.fim || null }
  })
})

/* ---------- Filtros ---------- */
const filterAnalyst = ref('')
const filterWallet = ref('')
const filterType = ref('')

const analystOptions = computed(() => {
  const names = new Set(rawItems.value.map(i => i.analyst_name))
  return Array.from(names).sort()
})

const walletOptionsInData = computed(() => {
  const wallets = new Set(rawItems.value.map(i => i.wallet))
  return Array.from(wallets).sort()
})

const filteredItems = computed(() => {
  return enrichedItems.value.filter(item => {
    const matchesAnalyst = !filterAnalyst.value || item.analyst_name === filterAnalyst.value
    const matchesWallet = !filterWallet.value || item.wallet === filterWallet.value
    const matchesType = !filterType.value || item.snapshot_type === filterType.value
    return matchesAnalyst && matchesWallet && matchesType
  })
})

/* ---------- PDF por lançamento ---------- */
function formatWeekLabel(weekStart) {
  const start = new Date(`${weekStart}T00:00:00Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 4)
  const fmt = dt => dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
  return `Semana de ${fmt(start)} a ${fmt(end)}`
}

function buildRows(inicioObj, fimObj) {
  const keys = new Set([...Object.keys(inicioObj || {}), ...Object.keys(fimObj || {})])
  return Array.from(keys).map(key => {
    const start = Number(inicioObj?.[key] || 0)
    const end = Number(fimObj?.[key] || 0)
    return { key, start, end, delta: end - start }
  })
}

function sanitizeFileName(value) {
  return String(value || 'relatorio')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

async function baixarPdfItem(item) {
  const inicio = item.pairInicio
  const fim = item.pairFim

  if (!inicio || !fim) {
    loadError.value =
      'O PDF visual completo só pode ser gerado quando existem os lançamentos de início e fim da semana.'
    return
  }

  try {
    loadError.value = ''

    const fidcRows = buildRows(inicio.fidc, fim.fidc)
    const factorRows = buildRows(inicio.factor, fim.factor)

    const allRows = [
      ...fidcRows.map(row => ({
        ...row,
        portfolio: 'FIDC'
      })),
      ...factorRows.map(row => ({
        ...row,
        portfolio: 'Factor'
      }))
    ]

    const biggestDrop = allRows.reduce(
      (minimum, row) =>
        row.delta < (minimum?.delta ?? Infinity)
          ? row
          : minimum,
      null
    )

    const biggestRise = allRows.reduce(
      (maximum, row) =>
        row.delta > (maximum?.delta ?? -Infinity)
          ? row
          : maximum,
      null
    )

    const alertas = allRows
      .filter(row =>
        /30 Dias|31\+ Dias|Minuta/i.test(row.key) &&
        row.delta > 0
      )
      .map(row => ({
        ...row,
        alerta: true,
        critico: true
      }))

    const normalizedFidcRows = fidcRows.map(row => ({
      ...row,
      critico: /30 Dias|31\+ Dias|Minuta/i.test(row.key),
      alerta:
        /30 Dias|31\+ Dias|Minuta/i.test(row.key) &&
        row.delta > 0
    }))

    const normalizedFactorRows = factorRows.map(row => ({
      ...row,
      critico: /30 Dias|31\+ Dias|Minuta/i.test(row.key),
      alerta:
        /30 Dias|31\+ Dias|Minuta/i.test(row.key) &&
        row.delta > 0
    }))

    const startTotal =
      normalizedFidcRows.reduce((total, row) => total + row.start, 0) +
      normalizedFactorRows.reduce((total, row) => total + row.start, 0)

    const endTotal =
      normalizedFidcRows.reduce((total, row) => total + row.end, 0) +
      normalizedFactorRows.reduce((total, row) => total + row.end, 0)

    const reportComparison = {
      weekLabel: formatWeekLabel(item.week_start),
      weekStart: item.week_start,
      wallet: item.wallet,
      inicio,
      fim,
      fidcRows: normalizedFidcRows,
      factorRows: normalizedFactorRows,
      biggestDrop,
      biggestRise,
      alertas,
      startTotal,
      endTotal,
      totalDelta: endTotal - startTotal,
      emittedBy:
        currentUserName.value ||
        session.value?.user?.email ||
        'Usuário',
      emittedAt: new Date().toLocaleString('pt-BR')
    }

    pdfReportData.value = buildPdfReport(reportComparison)

    await nextTick()
    await document.fonts?.ready

    const element = document.getElementById(
      'pdf-report-export-funcionarios'
    )

    if (!element) {
      throw new Error(
        'Não foi possível localizar o relatório para exportação.'
      )
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    })

    const imageData = canvas.toDataURL('image/png', 1)

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 8
    const availableWidth = pageWidth - margin * 2
    const availableHeight = pageHeight - margin * 2
    const imageWidth = availableWidth
    const imageHeight = canvas.height * imageWidth / canvas.width

    let remainingHeight = imageHeight
    let positionY = margin

    pdf.addImage(
      imageData,
      'PNG',
      margin,
      positionY,
      imageWidth,
      imageHeight,
      undefined,
      'FAST'
    )

    remainingHeight -= availableHeight

    while (remainingHeight > 0) {
      pdf.addPage()

      positionY = margin - (imageHeight - remainingHeight)

      pdf.addImage(
        imageData,
        'PNG',
        margin,
        positionY,
        imageWidth,
        imageHeight,
        undefined,
        'FAST'
      )

      remainingHeight -= availableHeight
    }

    pdf.save(
      `relatorio-${sanitizeFileName(item.wallet)}-${item.week_start}.pdf`
    )
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)

    loadError.value =
      error.message ||
      'Não foi possível gerar o PDF. Tente novamente.'
  }
}
</script>

<style scoped>
.timeline-page {
  --ink: #0a1510;
  --panel: #101d16;
  --panel-raised: #16261c;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.62);
  --jade: #6fe3a0;
  --jade-dim: rgba(111, 227, 160, 0.16);
  --brass: #eab766;
  --steel: #7fb6e3;
  --steel-dim: rgba(127, 182, 227, 0.16);
  --good: #6fe3a0;
  --bad: #ff9797;
  --radius: 0.9rem;

  font-family: 'Inter', system-ui, sans-serif;
  color: var(--paper);
  padding: 2.25rem clamp(1.25rem, 4vw, 3.5rem);
  min-height: 100vh;
  box-sizing: border-box;
  display: grid;
  gap: 1.75rem;
  max-width: 1240px;
  margin: 0 auto;
}

.timeline-page h1,
.timeline-page h2 {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
}

.timeline-page strong {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--jade);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.access-gate {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
  padding: 3rem 1rem;
}

.access-gate h2 {
  font-size: 1.3rem;
}

.page-header {
  padding-bottom: 1.4rem;
  border-bottom: 1px solid var(--line);
}

.page-header h1 {
  font-size: clamp(1.6rem, 2.6vw, 2.2rem);
}

.page-subtitle {
  margin: 0.6rem 0 0;
  color: var(--paper-dim);
  line-height: 1.6;
  font-size: 1rem;
}

.btn {
  border: none;
  border-radius: 0.7rem;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
}

.btn--primary {
  background: linear-gradient(135deg, #7bf0a6, #2fa85e);
  color: #05170c;
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.06);
  color: var(--paper);
  border: 1px solid var(--line);
}

/* ===== Equipe (cards) ===== */
.team-section {
  display: grid;
  gap: 1.1rem;
}

.team-section__title {
  font-size: 1.15rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.team-card {
  padding: 1.5rem 1.25rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}

.team-card__avatar {
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #fff;
}

.team-card__name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.02rem;
}

.team-card__role {
  color: var(--paper-dim);
  font-size: 0.8rem;
}

.team-card__btn {
  padding: 0.5rem 1.1rem;
  font-size: 0.82rem;
  margin-top: 0.4rem;
}

/* ===== Toolbar ===== */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.75rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
}

.field {
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--paper-dim);
}

.field--sm select {
  width: 13rem;
}

.field__select {
  padding: 0.65rem 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--paper);
  font-family: inherit;
}

.info-message {
  margin: 0;
  padding: 1rem 1.25rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--paper-dim);
  border-left: 3px solid var(--steel);
}

.error-banner {
  margin: 0;
  padding: 1rem 1.25rem;
  border-radius: 0.7rem;
  background: rgba(255, 148, 148, 0.1);
  border: 1px solid rgba(255, 148, 148, 0.35);
  color: var(--bad);
}

/* ===== Timeline ===== */
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  position: relative;
}

.timeline-item {
  display: grid;
  grid-template-columns: 1.2rem 1fr;
  gap: 1.25rem;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 0.55rem;
  top: 1.6rem;
  bottom: -1.1rem;
  width: 2px;
  background: var(--line);
}

.timeline-item__marker {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  margin-top: 0.35rem;
  border: 2px solid var(--ink);
  box-shadow: 0 0 0 2px var(--line);
}

.timeline-item__marker--inicio {
  background: var(--steel);
}

.timeline-item__marker--fim {
  background: var(--jade);
}

.timeline-card {
  padding: 1.4rem 1.6rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
  margin-bottom: 1.25rem;
  display: grid;
  gap: 1rem;
}

.timeline-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.timeline-card__head-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.btn-pdf {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
  color: var(--paper-dim);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.btn-pdf:hover {
  background: var(--jade-dim);
  color: var(--jade);
}

.timeline-card__who {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.timeline-card__who strong {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
}

.timeline-card__who small {
  color: var(--paper-dim);
  font-size: 0.86rem;
}

.avatar {
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.avatar--initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--jade-dim), rgba(111, 227, 160, 0.05));
  color: var(--jade);
  font-weight: 700;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
}

.tag {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.tag--steel {
  background: var(--steel-dim);
  color: var(--steel);
}

.tag--jade {
  background: var(--jade-dim);
  color: var(--jade);
}

.timeline-card__body {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  padding: 0.5rem 0.95rem;
  border-radius: 0.65rem;
  font-size: 0.86rem;
  color: var(--paper-dim);
  background: rgba(255, 255, 255, 0.05);
}

.chip strong {
  color: var(--paper);
}

.chip--good strong {
  color: var(--good);
}

.chip--bad strong {
  color: var(--bad);
}

.pdf-render-area {
  position: fixed;
  top: 0;
  left: -20000px;
  width: 1120px;
  pointer-events: none;
  opacity: 1;
  z-index: -1;
}

@media (max-width: 620px) {
  .timeline-page {
    padding: 1.25rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .field--sm select {
    width: 100%;
  }
}
</style>