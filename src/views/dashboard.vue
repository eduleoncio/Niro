<template>
  <div class="shell">
    <Sidebar v-model:collapsed="isSidebarCollapsed" />

    <main class="conteudo" :style="{ marginLeft: isSidebarCollapsed ? '80px' : '250px' }">

      <section v-if="isDashboardRoot" class="dash-content">

        <div v-if="!session" class="access-gate">A
          <p class="eyebrow">Acesso restrito</p>
          <h2>Você precisa estar logado para ver esta página.</h2>
          <RouterLink class="btn btn--primary" to="/login">Ir para o login</RouterLink>
        </div>

        <div v-else-if="accessChecked && !isTeamMember" class="access-gate">
          <p class="eyebrow">Acesso restrito</p>
          <h2>Este e-mail não tem permissão para o sistema de confirmação.</h2>
        </div>

        <template v-else-if="accessChecked && isTeamMember">
          <header class="page-header">
            <div class="page-header__text">
              <p class="eyebrow">Análise · confirmação</p>
              <h1>Dashboard</h1>
              <p class="page-subtitle">Visão geral dos canhotos: quem está subindo, quem está caindo, e onde prestar atenção.</p>
            </div>
          </header>

          <section class="toolbar">
            <label class="field field--week">
              <span>Semana</span>
              <CustomSelect v-model="selectedWeek" :options="weekSelectOptions" placeholder="Selecionar semana" />
            </label>
            <label class="field field--sm">
              <span>Carteira</span>
              <CustomSelect v-model="selectedWallet" :options="walletSelectOptions" placeholder="Todas" />
            </label>
          </section>

          <p v-if="loadError" class="error-banner">{{ loadError }}</p>

          <!-- ===== KPIs ===== -->
          <section class="kpi-grid">
            <article class="kpi-card">
              <span>Total início da semana</span>
              <strong>{{ formatCurrency(kpis.startTotal) }}</strong>
            </article>
            <article class="kpi-card">
              <span>Total fim da semana</span>
              <strong>{{ formatCurrency(kpis.endTotal) }}</strong>
            </article>
            <article class="kpi-card" :class="kpis.delta <= 0 ? 'kpi-card--good' : 'kpi-card--bad'">
              <span>Variação</span>
              <strong>{{ kpis.delta > 0 ? '+' : '' }}{{ formatCurrency(kpis.delta) }}</strong>
            </article>
            <article class="kpi-card">
              <span>Carteiras completas</span>
              <strong>{{ kpis.walletsCompletas }} / {{ ALL_WALLETS.length }}</strong>
            </article>
          </section>

          <!-- ===== Alertas agregados ===== -->
          <section v-if="alertasGerais.length" class="alert-banner">
            <strong>⚠ Categorias críticas subindo esta semana:</strong>

            <div v-if="alertasFidc.length" class="alert-group">
              <h4>FIDC</h4>
              <ul>
                <li v-for="a in alertasFidc" :key="`fidc-${a.wallet}-${a.key}`">
                  Carteira {{ a.wallet }} · {{ cleanCategoryLabel(a.key) }} — subiu {{ formatCurrency(a.delta) }}
                </li>
              </ul>
            </div>

            <div v-if="alertasFactor.length" class="alert-group">
              <h4>FACTOR</h4>
              <ul>
                <li v-for="a in alertasFactor" :key="`factor-${a.wallet}-${a.key}`">
                  Carteira {{ a.wallet }} · {{ cleanCategoryLabel(a.key) }} — subiu {{ formatCurrency(a.delta) }}
                </li>
              </ul>
            </div>
          </section>

          <!-- ===== Equipe (cards) ===== -->
          <TeamGrid title="Equipe" />

          <!-- ===== Gráficos ===== -->
          <section class="charts-grid">
            <div class="chart-card">
              <h3>Início × Fim por carteira</h3>
              <p class="chart-card__hint">{{ formatWeekLabel(selectedWeek) }}</p>
              <canvas ref="barCanvasRef" height="220"></canvas>
            </div>
            <div class="chart-card">
              <h3>Evolução ao longo das semanas</h3>
              <p class="chart-card__hint">Total (fim) por semana, últimas {{ trendData.labels.length }} semanas</p>
              <canvas ref="lineCanvasRef" height="220"></canvas>
            </div>
          </section>

          <!-- ===== Ranking de categorias ===== -->
          <section class="conf-table">
            <div class="conf-table__row conf-table__row--head">
              <span>Categoria</span>
              <span>Início</span>
              <span>Fim</span>
              <span>Variação</span>
            </div>

            <template v-if="categoryRankingFactor.length">
              <div class="conf-table__group-label">Factor</div>
              <div
                v-for="row in categoryRankingFactor" :key="row.key"
                class="conf-table__row"
                :class="{ 'conf-table__row--alert': row.critico && row.delta > 0 }"
              >
                <span>{{ row.label }} <em v-if="row.critico" class="conf-table__tag">crítico</em></span>
                <span>{{ formatCurrency(row.inicio) }}</span>
                <span>{{ formatCurrency(row.fim) }}</span>
                <strong :class="row.delta <= 0 ? 'delta--good' : 'delta--bad'">
                  {{ row.delta > 0 ? '+' : '' }}{{ formatCurrency(row.delta) }}
                </strong>
              </div>
            </template>

            <div v-if="categoryRankingFactor.length && categoryRankingFidc.length" class="conf-table__divider"></div>

            <template v-if="categoryRankingFidc.length">
              <div class="conf-table__group-label">FIDC</div>
              <div
                v-for="row in categoryRankingFidc" :key="row.key"
                class="conf-table__row"
                :class="{ 'conf-table__row--alert': row.critico && row.delta > 0 }"
              >
                <span>{{ row.label }} <em v-if="row.critico" class="conf-table__tag">crítico</em></span>
                <span>{{ formatCurrency(row.inicio) }}</span>
                <span>{{ formatCurrency(row.fim) }}</span>
                <strong :class="row.delta <= 0 ? 'delta--good' : 'delta--bad'">
                  {{ row.delta > 0 ? '+' : '' }}{{ formatCurrency(row.delta) }}
                </strong>
              </div>
            </template>

            <p v-if="!categoryRankingFactor.length && !categoryRankingFidc.length" class="info-message">Sem lançamentos nesta semana ainda.</p>
          </section>

          
        </template>
      </section>

      <RouterView v-if="!isDashboardRoot" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'
import Sidebar from '../components/sidebar.vue'
import CustomSelect from '../components/CustomSelect.vue'
import TeamGrid from '../components/TeamGrid.vue'
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const isSidebarCollapsed = ref(true)
const route = useRoute()
const isDashboardRoot = computed(() => route.path === '/dashboard')

const { session, supabase } = useSupabase()

/* ---------- Acesso: qualquer pessoa cadastrada em team_access ---------- */
const accessChecked = ref(false)
const isTeamMember = ref(false)

async function resolveAccess(email) {
  accessChecked.value = false
  isTeamMember.value = false
  if (!email) { accessChecked.value = true; return }

  try {
    const { data, error } = await supabase
      .from('team_access')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (error) throw error
    isTeamMember.value = !!data
  } catch (e) {
    console.error(e)
  } finally {
    accessChecked.value = true
  }
}

watch(() => session.value?.user?.email, (email) => resolveAccess(email), { immediate: true })

/* ---------- Dados ---------- */
const ALL_WALLETS = ['Letícia', 'Herculano', 'Thiago', 'Thamires', 'Daiane', 'Douglas']
const GERAL_WALLET = 'Geral (conferência)'
const MONTH_NAMES_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const rawItems = ref([])
const loadError = ref('')

function isCriticalCategory(key) {
  return /30 Dias|31\+ Dias|Minuta/i.test(key)
}

function sumObject(obj) {
  if (!obj) return 0
  return Object.values(obj).reduce((s, v) => s + Number(v || 0), 0)
}

function formatCurrency(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatWeekLabel(weekStart) {
  if (!weekStart) return '—'
  const start = new Date(`${weekStart}T00:00:00Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 4)
  const fmt = dt => dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
  return `Semana de ${fmt(start)} a ${fmt(end)}`
}

/* ---------- Rótulo de categoria sem repetir FIDC / Factor / Geral ---------- */
function cleanCategoryLabel(key) {
  return key
    .split(' - ')
    .filter(part => !/^(FIDC|Factor|Geral)$/i.test(part.trim()))
    .join(' - ')
}

function categoryGroup(key) {
  if (/factor/i.test(key)) return 'factor'
  if (/fidc/i.test(key)) return 'fidc'
  return 'outro'
}

/* ---------- Helpers de mês ---------- */
function monthKeyFromWeek(weekStart) {
  return weekStart.slice(0, 7) // 'YYYY-MM'
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_NAMES_PT[month - 1]} ${year}`
}

function formatMonthLabelShort(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_NAMES_PT[month - 1].slice(0, 3)}/${String(year).slice(2)}`
}

async function carregarDados() {
  loadError.value = ''
  try {
    const { data, error } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .neq('wallet', GERAL_WALLET)
      .order('week_start', { ascending: false })

    if (error) throw error
    rawItems.value = data
  } catch (e) {
    console.error(e)
    loadError.value = 'Não foi possível carregar os dados do dashboard.'
  }
}

onMounted(() => {
  if (isDashboardRoot.value) carregarDados()
})

watch(isDashboardRoot, (isRoot) => {
  if (isRoot && !rawItems.value.length) carregarDados()
})

/* ---------- Filtros (semanais) ---------- */
const weeksAvailable = computed(() => {
  const weeks = new Set(rawItems.value.map(i => i.week_start))
  return Array.from(weeks).sort((a, b) => (a < b ? 1 : -1))
})

const selectedWeek = ref('')
watch(weeksAvailable, (weeks) => {
  if (!selectedWeek.value && weeks.length) selectedWeek.value = weeks[0]
}, { immediate: true })

const weekSelectOptions = computed(() =>
  weeksAvailable.value.map(w => ({ value: w, label: formatWeekLabel(w) }))
)

const selectedWallet = ref('')

const walletSelectOptions = computed(() => [
  { value: '', label: 'Todas' },
  ...ALL_WALLETS.map(w => ({ value: w, label: w }))
])

const itemsForWeek = computed(() => rawItems.value.filter(i =>
  i.week_start === selectedWeek.value && (!selectedWallet.value || i.wallet === selectedWallet.value)
))

/* ---------- KPIs (semanais) ---------- */
const kpis = computed(() => {
  const inicioItems = itemsForWeek.value.filter(i => i.snapshot_type === 'inicio')
  const fimItems = itemsForWeek.value.filter(i => i.snapshot_type === 'fim')
  const startTotal = inicioItems.reduce((s, i) => s + sumObject(i.fidc) + sumObject(i.factor), 0)
  const endTotal = fimItems.reduce((s, i) => s + sumObject(i.fidc) + sumObject(i.factor), 0)

  const wallets = selectedWallet.value ? [selectedWallet.value] : ALL_WALLETS
  const walletsCompletas = wallets.filter(w =>
    inicioItems.some(i => i.wallet === w) && fimItems.some(i => i.wallet === w)
  ).length

  return { startTotal, endTotal, delta: endTotal - startTotal, walletsCompletas }
})

/* ---------- Alertas agregados (por carteira) ---------- */
const alertasGerais = computed(() => {
  const alertas = []
  const byWallet = new Map()

  itemsForWeek.value.forEach(item => {
    if (!byWallet.has(item.wallet)) {
      byWallet.set(item.wallet, {})
    }

    byWallet.get(item.wallet)[item.snapshot_type] = item
  })

  byWallet.forEach((pair, wallet) => {
    if (!pair.inicio || !pair.fim) return

    const grupos = [
      {
        group: 'fidc',
        inicio: pair.inicio.fidc || {},
        fim: pair.fim.fidc || {}
      },
      {
        group: 'factor',
        inicio: pair.inicio.factor || {},
        fim: pair.fim.factor || {}
      }
    ]

    grupos.forEach(({ group, inicio, fim }) => {
      const keys = new Set([
        ...Object.keys(inicio),
        ...Object.keys(fim)
      ])

      keys.forEach(key => {
        const start = Number(inicio[key] || 0)
        const end = Number(fim[key] || 0)
        const delta = end - start

        if (isCriticalCategory(key) && delta > 0) {
          alertas.push({
            wallet,
            key,
            group,
            delta
          })
        }
      })
    })
  })

  return alertas.sort((a, b) => b.delta - a.delta)
})

const alertasFidc = computed(() =>
  alertasGerais.value.filter(alerta => alerta.group === 'fidc')
)

const alertasFactor = computed(() =>
  alertasGerais.value.filter(alerta => alerta.group === 'factor')
)

/* ---------- Ranking de categorias (separado por Factor / FIDC) ---------- */
const categoryRanking = computed(() => {
  const inicioItems = itemsForWeek.value.filter(i => i.snapshot_type === 'inicio')
  const fimItems = itemsForWeek.value.filter(i => i.snapshot_type === 'fim')

  const somaInicio = {}
  const somaFim = {}
  inicioItems.forEach(i => {
    Object.entries({ ...i.fidc, ...i.factor }).forEach(([k, v]) => { somaInicio[k] = (somaInicio[k] || 0) + Number(v || 0) })
  })
  fimItems.forEach(i => {
    Object.entries({ ...i.fidc, ...i.factor }).forEach(([k, v]) => { somaFim[k] = (somaFim[k] || 0) + Number(v || 0) })
  })

  const keys = new Set([...Object.keys(somaInicio), ...Object.keys(somaFim)])
  return Array.from(keys).map(key => {
    const inicio = somaInicio[key] || 0
    const fim = somaFim[key] || 0
    return {
      key,
      label: cleanCategoryLabel(key),
      group: categoryGroup(key),
      inicio,
      fim,
      delta: fim - inicio,
      critico: isCriticalCategory(key)
    }
  }).sort((a, b) => a.delta - b.delta)
})

const categoryRankingFactor = computed(() => categoryRanking.value.filter(r => r.group === 'factor'))
const categoryRankingFidc = computed(() => categoryRanking.value.filter(r => r.group === 'fidc'))

/* ---------- Tendência semanal (últimas semanas) ---------- */
const trendData = computed(() => {
  const byWeek = new Map()
  rawItems.value.forEach(item => {
    if (!byWeek.has(item.week_start)) byWeek.set(item.week_start, { inicio: 0, fim: 0 })
    const total = sumObject(item.fidc) + sumObject(item.factor)
    if (item.snapshot_type === 'inicio') byWeek.get(item.week_start).inicio += total
    else byWeek.get(item.week_start).fim += total
  })

  const weeks = Array.from(byWeek.keys()).sort().slice(-12)
  return {
    labels: weeks.map(w => formatWeekLabel(w).replace('Semana de ', '')),
    inicio: weeks.map(w => byWeek.get(w).inicio),
    fim: weeks.map(w => byWeek.get(w).fim)
  }
})

/* ---------- Comparativo mensal ---------- */
const monthlyAggregates = computed(() => {
  const byMonth = new Map()

  rawItems.value.forEach(item => {
    const monthKey = monthKeyFromWeek(item.week_start)
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, { inicio: 0, fim: 0, byWallet: new Map() })
    }
    const bucket = byMonth.get(monthKey)
    const total = sumObject(item.fidc) + sumObject(item.factor)

    if (item.snapshot_type === 'inicio') bucket.inicio += total
    else bucket.fim += total

    if (!bucket.byWallet.has(item.wallet)) {
      bucket.byWallet.set(item.wallet, { inicio: 0, fim: 0 })
    }
    const walletBucket = bucket.byWallet.get(item.wallet)
    if (item.snapshot_type === 'inicio') walletBucket.inicio += total
    else walletBucket.fim += total
  })

  return byMonth
})

const monthsAvailable = computed(() => {
  return Array.from(monthlyAggregates.value.keys()).sort((a, b) => (a < b ? 1 : -1))
})

const selectedMonth = ref('')
watch(monthsAvailable, (months) => {
  if (!selectedMonth.value && months.length) selectedMonth.value = months[0]
}, { immediate: true })

const monthSelectOptions = computed(() =>
  monthsAvailable.value.map(m => ({ value: m, label: formatMonthLabel(m) }))
)

const monthlyKpis = computed(() => {
  const bucket = monthlyAggregates.value.get(selectedMonth.value)
  if (!bucket) return { inicio: 0, fim: 0, delta: 0 }
  return { inicio: bucket.inicio, fim: bucket.fim, delta: bucket.fim - bucket.inicio }
})

const totalBaixadoMes = computed(() => -monthlyKpis.value.delta)

const previousMonthKey = computed(() => {
  const months = monthsAvailable.value // mais recente primeiro
  const idx = months.indexOf(selectedMonth.value)
  return idx >= 0 && idx + 1 < months.length ? months[idx + 1] : null
})

const monthlyComparisonPrevious = computed(() => {
  if (!previousMonthKey.value) return null
  const bucket = monthlyAggregates.value.get(previousMonthKey.value)
  if (!bucket) return null
  const prevBaixado = bucket.inicio - bucket.fim
  return {
    monthLabel: formatMonthLabel(previousMonthKey.value),
    diff: totalBaixadoMes.value - prevBaixado
  }
})

const monthlyWalletBreakdown = computed(() => {
  const bucket = monthlyAggregates.value.get(selectedMonth.value)
  if (!bucket) return []
  return ALL_WALLETS.map(wallet => {
    const w = bucket.byWallet.get(wallet) || { inicio: 0, fim: 0 }
    return { wallet, inicio: w.inicio, fim: w.fim, delta: w.fim - w.inicio }
  })
})

const monthlyTrend = computed(() => {
  const months = Array.from(monthlyAggregates.value.keys()).sort().slice(-12)
  return {
    labels: months.map(formatMonthLabelShort),
    inicio: months.map(m => monthlyAggregates.value.get(m).inicio),
    fim: months.map(m => monthlyAggregates.value.get(m).fim)
  }
})

/* ---------- PDF do comparativo mensal ---------- */
const generatingMonthlyPdf = ref(false)
const monthlyChartImage = ref('')
const monthlyPdfGeneratedAt = ref('')

function buildMonthlyChartImage() {
  if (!monthlyChart) return ''

  return monthlyChart.toBase64Image(
    'image/png',
    1
  )
}

async function baixarComparativoMensalPdf() {
  if (!selectedMonth.value) {
    loadError.value = 'Selecione um mês antes de gerar o PDF.'
    return
  }

  if (!monthlyWalletBreakdown.value.length) {
    loadError.value = 'Não existem lançamentos para gerar o comparativo deste mês.'
    return
  }

  generatingMonthlyPdf.value = true
  loadError.value = ''

  try {
    monthlyChartImage.value = buildMonthlyChartImage()
    monthlyPdfGeneratedAt.value = new Date().toLocaleString('pt-BR')

    await nextTick()

    const element = document.getElementById('monthly-comparison-pdf')

    if (!element) {
      throw new Error('Não foi possível localizar o relatório mensal.')
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f4f7f1',
      logging: false
    })

    const imageData = canvas.toDataURL('image/png', 1)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 8
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2

    const imageWidth = canvas.width
    const imageHeight = canvas.height
    const ratio = Math.min(
      usableWidth / imageWidth,
      usableHeight / imageHeight
    )

    const renderedWidth = imageWidth * ratio
    const renderedHeight = imageHeight * ratio
    const positionX = (pageWidth - renderedWidth) / 2
    const positionY = (pageHeight - renderedHeight) / 2

    pdf.addImage(
      imageData,
      'PNG',
      positionX,
      positionY,
      renderedWidth,
      renderedHeight,
      undefined,
      'FAST'
    )

    pdf.save(
      `comparativo-mensal-${selectedMonth.value}.pdf`
    )
  } catch (error) {
    console.error(
      'Erro ao gerar PDF mensal:',
      error
    )

    loadError.value =
      error.message ||
      'Não foi possível gerar o PDF do comparativo mensal.'
  } finally {
    generatingMonthlyPdf.value = false
  }
}

/* ---------- Gráficos (Chart.js) ---------- */
const barCanvasRef = ref(null)
const lineCanvasRef = ref(null)
const monthlyCanvasRef = ref(null)
let barChart = null
let lineChart = null
let monthlyChart = null

function renderBarChart() {
  if (!barCanvasRef.value) return
  const wallets = selectedWallet.value ? [selectedWallet.value] : ALL_WALLETS
  const inicioItems = itemsForWeek.value.filter(i => i.snapshot_type === 'inicio')
  const fimItems = itemsForWeek.value.filter(i => i.snapshot_type === 'fim')

  const inicioPorCarteira = wallets.map(w => {
    const item = inicioItems.find(i => i.wallet === w)
    return item ? sumObject(item.fidc) + sumObject(item.factor) : 0
  })
  const fimPorCarteira = wallets.map(w => {
    const item = fimItems.find(i => i.wallet === w)
    return item ? sumObject(item.fidc) + sumObject(item.factor) : 0
  })

  if (barChart) barChart.destroy()
  barChart = new Chart(barCanvasRef.value, {
    type: 'bar',
    data: {
      labels: wallets,
      datasets: [
        { label: 'Início', data: inicioPorCarteira, backgroundColor: '#7fb6e3' },
        { label: 'Fim', data: fimPorCarteira, backgroundColor: '#6fe3a0' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#eef4ee' } } },
      scales: {
        x: { ticks: { color: '#eef4ee' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: {
          title: {
            display: true,
            text: 'Valores (R$)',
            color: '#eef4ee'
          },
          ticks: {
            color: '#eef4ee',
            callback: value => `R$ ${Number(value).toLocaleString('pt-BR')}`
          },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  })
}

function renderLineChart() {
  if (!lineCanvasRef.value) return
  if (lineChart) lineChart.destroy()
  lineChart = new Chart(lineCanvasRef.value, {
    type: 'line',
    data: {
      labels: trendData.value.labels,
      datasets: [
        { label: 'Início', data: trendData.value.inicio, borderColor: '#7fb6e3', backgroundColor: 'rgba(127,182,227,0.15)', tension: 0.3 },
        { label: 'Fim', data: trendData.value.fim, borderColor: '#6fe3a0', backgroundColor: 'rgba(111,227,160,0.15)', tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#eef4ee' } } },
      scales: {
        x: { ticks: { color: '#eef4ee' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: {
          title: {
            display: true,
            text: 'Valores (R$)',
            color: '#eef4ee'
          },
          ticks: {
            color: '#eef4ee',
            callback: value => `R$ ${Number(value).toLocaleString('pt-BR')}`
          },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  })
}

function renderMonthlyChart() {
  if (!monthlyCanvasRef.value) return
  if (monthlyChart) monthlyChart.destroy()
  monthlyChart = new Chart(monthlyCanvasRef.value, {
    type: 'bar',
    data: {
      labels: monthlyTrend.value.labels,
      datasets: [
        { label: 'Início', data: monthlyTrend.value.inicio, backgroundColor: '#7fb6e3' },
        { label: 'Fim', data: monthlyTrend.value.fim, backgroundColor: '#6fe3a0' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#eef4ee' } } },
      scales: {
        x: { ticks: { color: '#eef4ee' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: {
          title: {
            display: true,
            text: 'Valores (R$)',
            color: '#eef4ee'
          },
          ticks: {
            color: '#eef4ee',
            callback: value => `R$ ${Number(value).toLocaleString('pt-BR')}`
          },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  })
}

watch([itemsForWeek, selectedWallet], () => nextTick(renderBarChart))
watch(trendData, () => nextTick(renderLineChart))
watch(monthlyTrend, () => nextTick(renderMonthlyChart))
watch(rawItems, () => nextTick(() => { renderBarChart(); renderLineChart(); renderMonthlyChart() }))
</script>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  background: url(../assets/background-geral.svg);
  font-family: 'Montserrat', sans-serif;
}

.conteudo {
  flex: 1;
  margin-left: 80px;
  padding: 30px;
  color: #f4f7f1;
  transition: margin-left 0.3s ease;
  min-width: 0;
}

.dash-content {
  --ink: #0a1510;
  --panel: #101d16;
  --panel-raised: #16261c;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.62);
  --jade: #6fe3a0;
  --jade-dim: rgba(111, 227, 160, 0.16);
  --brass: #eab766;
  --brass-dim: rgba(234, 183, 102, 0.16);
  --steel: #7fb6e3;
  --good: #6fe3a0;
  --bad: #ff9797;
  --radius: 0.9rem;
  --gap: 1.25rem;

  font-family: 'Inter', system-ui, sans-serif;
  color: var(--paper);
  display: grid;
  gap: 1.5rem;
}

.dash-content h1, .dash-content h2, .dash-content h3 {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 600;
  margin: 0;
}

.dash-content strong {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

.eyebrow {
  color: var(--jade);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.access-gate { display: grid; gap: 0.75rem; padding: 3rem 1.5rem; }
.page-header { padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
.page-header h1 { font-size: clamp(1.5rem, 2.4vw, 2rem); }
.page-subtitle { margin: 0.5rem 0 0; color: var(--paper-dim); }

.btn { border: none; border-radius: 0.7rem; padding: 0.75rem 1.1rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; }
.btn--primary { background: linear-gradient(135deg, #7bf0a6, #2fa85e); color: #05170c; }

.btn--pdf {
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid rgba(111, 227, 160, 0.32);
  background: rgba(111, 227, 160, 0.1);
  color: var(--jade);
}

.btn--pdf:hover:not(:disabled) {
  background: rgba(111, 227, 160, 0.17);
}

.btn--pdf:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1rem 1.2rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
}

.field { display: grid; gap: 0.3rem; font-size: 0.85rem; color: var(--paper-dim); }
.field--sm { width: 12rem; }
.field--week { width: 17rem; }
.field--week :deep(select),
.field--week :deep(button) { white-space: nowrap; }

.error-banner {
  margin: 0; padding: 0.9rem 1.1rem; border-radius: 0.7rem;
  background: rgba(255, 148, 148, 0.1); border: 1px solid rgba(255, 148, 148, 0.35); color: var(--bad);
}

.info-message {
  margin: 0; padding: 0.9rem 1.1rem; border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.05); color: var(--paper-dim); border-left: 3px solid var(--steel);
}

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--gap); }

.kpi-card {
  padding: 1.1rem 1.25rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.kpi-card span { color: var(--paper-dim); font-size: 0.82rem; }
.kpi-card strong { font-size: 1.3rem; }
.kpi-card--good strong { color: var(--good); }
.kpi-card--bad strong { color: var(--bad); }

.alert-banner {
  padding: 1rem 1.2rem; border-radius: var(--radius);
  background: rgba(255, 151, 151, 0.1); border: 1px solid rgba(255, 151, 151, 0.35); color: var(--paper);
}
.alert-banner strong { color: var(--bad); font-family: 'Inter', sans-serif; }
.alert-banner ul { margin: 0.5rem 0 0; padding-left: 1.2rem; color: var(--paper-dim); font-size: 0.85rem; }

.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap); }

.chart-card {
  padding: 1.2rem 1.3rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
}

.chart-card__hint { margin: 0.2rem 0 1rem; color: var(--paper-dim); font-size: 0.82rem; }

.conf-table { border-radius: var(--radius); background: var(--panel); border: 1px solid var(--line); overflow: hidden; }

.conf-table__row {
  display: grid;
  grid-template-columns: 2.4fr 1fr 1fr 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 1rem;
  font-size: 0.84rem;
  border-top: 1px solid var(--line);
}

.conf-table__row--head {
  border-top: none;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--paper-dim);
  background: rgba(255, 255, 255, 0.03);
}

.conf-table__group-label {
  padding: 0.5rem 1rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--jade);
  background: rgba(111, 227, 160, 0.08);
  border-top: 1px solid var(--line);
}

.conf-table__divider {
  height: 1px;
  background: var(--line);
}

.conf-table__row:nth-of-type(even) { background: rgba(255, 255, 255, 0.015); }
.conf-table__row--alert { background: rgba(255, 151, 151, 0.12); }
.conf-table__row span:not(.conf-table__tag) { color: var(--paper-dim); }
.conf-table__row strong { text-align: right; }

.conf-table__tag {
  font-style: normal;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--brass);
  background: var(--brass-dim);
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  margin-left: 0.4rem;
}

.delta--good { color: var(--good); }
.delta--bad { color: var(--bad); }

.alert-group {
  margin-top: 0.9rem;
}

.alert-group h4 {
  margin: 0 0 0.35rem;
  color: var(--paper);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.alert-group ul {
  margin-top: 0.25rem;
}



/* ============================================================
   RESPONSIVIDADE — DASHBOARD
   ============================================================ */
.shell,
.conteudo,
.dash-content,
.toolbar,
.kpi-grid,
.charts-grid,
.chart-card,
.conf-table {
  min-width: 0;
}

.chart-card canvas {
  display: block;
  max-width: 100%;
}

@media (max-width: 1280px) {
  .dash-content {
    padding: 1.75rem clamp(1rem, 2.5vw, 2rem);
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .conteudo {
    margin-left: 80px !important;
    width: calc(100% - 80px);
  }

  .dash-content {
    padding: 1.35rem 1rem 2rem;
  }

  .page-header h1 {
    font-size: clamp(1.8rem, 5vw, 2.35rem);
  }

  .toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .field,
  .field--week,
  .field--sm {
    width: 100%;
    min-width: 0;
  }

  .chart-card {
    overflow: hidden;
  }

  .conf-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .conf-table__row,
  .conf-table__group-label,
  .conf-table__divider {
    min-width: 700px;
  }
}

@media (max-width: 640px) {
  .conteudo {
    margin-left: 0 !important;
    width: 100%;
  }

  .dash-content {
    padding: 1rem 0.75rem 1.5rem;
  }

  .page-header h1 {
    font-size: clamp(1.7rem, 8vw, 2.1rem);
  }

  .page-subtitle {
    font-size: 0.86rem;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .kpi-card {
    min-height: auto;
  }

  .alert-banner {
    padding: 0.9rem;
    font-size: 0.84rem;
  }

  .alert-group ul {
    padding-left: 1.1rem;
  }

  .chart-card {
    padding: 1rem;
  }

  .chart-card canvas {
    min-height: 260px;
  }
}
</style>