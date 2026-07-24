<template>
  <section class="mensal-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Análise · confirmação</p>
        <h1>Comparativo mensal</h1>

        <p class="page-subtitle">
          Acompanhe a abertura, o fechamento e a redução dos recebíveis
          consolidados por mês.
        </p>
      </div>
    </header>

    <div
      v-if="carregando"
      class="loading-card"
    >
      <span class="loading-spinner"></span>

      <div>
        <strong>Carregando comparativo...</strong>
        <p>Buscando os lançamentos mensais.</p>
      </div>
    </div>

    <p
      v-else-if="erro"
      class="error-banner"
    >
      {{ erro }}
    </p>

    <template v-else>
      <section class="toolbar">
        <label class="field">
          <span>Mês</span>

          <CustomSelect
            v-model="mesSelecionado"
            :options="opcoesDeMes"
            placeholder="Selecionar mês"
          />
        </label>

        <button
          type="button"
          class="btn btn--pdf"
          :disabled="
            !mesSelecionado ||
            gerandoPdf ||
            !detalhamentoPorCarteira.length
          "
          @click="baixarPdf"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          {{ gerandoPdf ? 'Gerando PDF...' : 'Baixar relatório em PDF' }}
        </button>
      </section>

      <p
        v-if="mensagemPdf"
        class="error-banner"
      >
        {{ mensagemPdf }}
      </p>

      <div
        id="relatorio-mensal"
        class="monthly-report"
      >
        <section class="kpi-grid">
          <article class="kpi-card">
            <span>Total início do mês</span>
            <strong>{{ formatarMoeda(kpis.inicio) }}</strong>
          </article>

          <article class="kpi-card">
            <span>Total fim do mês</span>
            <strong>{{ formatarMoeda(kpis.fim) }}</strong>
          </article>

          <article
            class="kpi-card"
            :class="
              totalBaixado >= 0
                ? 'kpi-card--good'
                : 'kpi-card--bad'
            "
          >
            <span>Total baixado no mês</span>

            <strong>
              {{ formatarMoeda(totalBaixado) }}
            </strong>
          </article>

          <article
            class="kpi-card"
            :class="
              comparacaoAnterior?.diferenca >= 0
                ? 'kpi-card--good'
                : 'kpi-card--bad'
            "
          >
            <span>
              {{
                comparacaoAnterior
                  ? `Vs. ${comparacaoAnterior.rotulo}`
                  : 'Comparação anterior'
              }}
            </span>

            <strong v-if="comparacaoAnterior">
              {{
                comparacaoAnterior.diferenca > 0
                  ? '+'
                  : ''
              }}
              {{
                formatarMoeda(
                  comparacaoAnterior.diferenca
                )
              }}
            </strong>

            <strong v-else>—</strong>
          </article>
        </section>

        <section class="chart-card">
          <div class="chart-card__header">
            <div>
              <h2>Evolução mensal</h2>

              <p class="chart-card__hint">
                Valores de início e fim dos últimos
                {{ tendenciaMensal.labels.length }} meses.
              </p>
            </div>

            <span class="month-tag">
              {{ formatarMes(mesSelecionado) }}
            </span>
          </div>

          <div class="chart-wrap">
            <canvas ref="graficoCanvas"></canvas>
          </div>
        </section>

        <section class="table-card">
          <header class="table-card__header">
            <div>
              <h2>Detalhamento por carteira</h2>

              <p>
                Totais consolidados para
                {{ formatarMes(mesSelecionado) }}.
              </p>
            </div>
          </header>

          <div
            v-if="detalhamentoPorCarteira.length"
            class="conf-table"
          >
            <div class="conf-table__row conf-table__row--head">
              <span>Carteira</span>
              <span>Início</span>
              <span>Fim</span>
              <span>Variação</span>
              <span>Total baixado</span>
            </div>

            <div
              v-for="linha in detalhamentoPorCarteira"
              :key="linha.carteira"
              class="conf-table__row"
            >
              <strong class="wallet-name">
                {{ linha.carteira }}
              </strong>

              <span>
                {{ formatarMoeda(linha.inicio) }}
              </span>

              <span>
                {{ formatarMoeda(linha.fim) }}
              </span>

              <strong
                :class="
                  linha.variacao <= 0
                    ? 'delta--good'
                    : 'delta--bad'
                "
              >
                {{ linha.variacao > 0 ? '+' : '' }}
                {{ formatarMoeda(linha.variacao) }}
              </strong>

              <strong
                :class="
                  linha.baixado >= 0
                    ? 'delta--good'
                    : 'delta--bad'
                "
              >
                {{ formatarMoeda(linha.baixado) }}
              </strong>
            </div>
          </div>

          <p
            v-else
            class="info-message"
          >
            Não existem lançamentos para o mês selecionado.
          </p>
        </section>
      </div>
    </template>

      <div class="monthly-pdf-render-area" aria-hidden="true">
        <section id="relatorio-mensal-pdf" class="monthly-pdf-document">
          <header class="monthly-pdf-header">
            <div>
              <p class="monthly-pdf-eyebrow">Controle de recebíveis</p>
              <h1>Comparativo mensal</h1>
              <p>{{ formatarMes(mesSelecionado) }}</p>
            </div>

            <div class="monthly-pdf-meta">
              <span>Período analisado</span>
              <strong>{{ formatarMes(mesSelecionado) }}</strong>
              <small>Relatório consolidado por carteira</small>
            </div>
          </header>

          <div class="monthly-pdf-rule"></div>

          <section class="monthly-pdf-kpis">
            <article>
              <span>Total no início</span>
              <strong>{{ formatarMoeda(kpis.inicio) }}</strong>
            </article>

            <article>
              <span>Total no fim</span>
              <strong>{{ formatarMoeda(kpis.fim) }}</strong>
            </article>

            <article :class="totalBaixado >= 0 ? 'pdf-good' : 'pdf-bad'">
              <span>Total baixado</span>
              <strong>{{ formatarMoeda(totalBaixado) }}</strong>
            </article>

            <article>
              <span>Carteiras analisadas</span>
              <strong>{{ detalhamentoPorCarteira.length }}</strong>
            </article>
          </section>

          <section class="monthly-pdf-table-card">
            <div class="monthly-pdf-section-title">
              <div>
                <p class="monthly-pdf-eyebrow">Detalhamento</p>
                <h2>Resultado por carteira</h2>
              </div>
              <span>Valores em R$</span>
            </div>

            <table class="monthly-pdf-table">
              <thead>
                <tr>
                  <th>Carteira</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Variação</th>
                  <th>Total baixado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="linha in detalhamentoPorCarteira" :key="`pdf-${linha.carteira}`">
                  <td><strong>{{ linha.carteira }}</strong></td>
                  <td>{{ formatarMoeda(linha.inicio) }}</td>
                  <td>{{ formatarMoeda(linha.fim) }}</td>
                  <td :class="linha.variacao <= 0 ? 'pdf-good-text' : 'pdf-bad-text'">
                    {{ linha.variacao > 0 ? '+' : '' }}{{ formatarMoeda(linha.variacao) }}
                  </td>
                  <td :class="linha.baixado >= 0 ? 'pdf-good-text' : 'pdf-bad-text'">
                    {{ formatarMoeda(linha.baixado) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <footer class="monthly-pdf-footer">
            <span>ConfirmaHub · Controle de recebíveis</span>
            <span>Gerado em {{ new Date().toLocaleString('pt-BR') }}</span>
          </footer>
        </section>
      </div>

  </section>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'

import Chart from 'chart.js/auto'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import CustomSelect from '../components/CustomSelect.vue'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const CARTEIRAS = [
  'Letícia',
  'Herculano',
  'Thiago',
  'Thamires',
  'Daiane',
  'Douglas'
]

const CARTEIRA_GERAL = 'Geral (conferência)'

const NOMES_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

const itens = ref([])
const carregando = ref(true)
const erro = ref('')
const mensagemPdf = ref('')

const mesSelecionado = ref('')
const gerandoPdf = ref(false)

const graficoCanvas = ref(null)

let grafico = null

function somarObjeto(objeto) {
  if (!objeto) {
    return 0
  }

  return Object.values(objeto).reduce(
    (total, valor) =>
      total + Number(valor || 0),
    0
  )
}

function totalDoItem(item) {
  return (
    somarObjeto(item.fidc) +
    somarObjeto(item.factor)
  )
}

function obterChaveMes(dataSemana) {
  if (!dataSemana) {
    return ''
  }

  return String(dataSemana).slice(0, 7)
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  )
}

function formatarMes(chaveMes) {
  if (!chaveMes) {
    return '—'
  }

  const [
    ano,
    numeroMes
  ] = chaveMes
    .split('-')
    .map(Number)

  return `${NOMES_MESES[numeroMes - 1]} ${ano}`
}

function formatarMesCurto(chaveMes) {
  if (!chaveMes) {
    return ''
  }

  const [
    ano,
    numeroMes
  ] = chaveMes
    .split('-')
    .map(Number)

  return `${
    NOMES_MESES[numeroMes - 1].slice(0, 3)
  }/${String(ano).slice(-2)}`
}

async function carregarDados() {
  carregando.value = true
  erro.value = ''

  try {
    const {
      data,
      error
    } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .neq('wallet', CARTEIRA_GERAL)
      .order('week_start', {
        ascending: false
      })

    if (error) {
      throw error
    }

    itens.value = data || []
  } catch (error) {
    console.error(
      'Erro ao carregar dados mensais:',
      error
    )

    erro.value =
      'Não foi possível carregar o comparativo mensal.'
  } finally {
    carregando.value = false
  }
}

const agregadosMensais = computed(() => {
  const meses = new Map()

  itens.value.forEach(item => {
    const chaveMes =
      obterChaveMes(item.week_start)

    if (!chaveMes) {
      return
    }

    if (!meses.has(chaveMes)) {
      meses.set(chaveMes, {
        inicio: 0,
        fim: 0,
        porCarteira: new Map()
      })
    }

    const mes = meses.get(chaveMes)
    const total = totalDoItem(item)

    if (item.snapshot_type === 'inicio') {
      mes.inicio += total
    }

    if (item.snapshot_type === 'fim') {
      mes.fim += total
    }

    if (!mes.porCarteira.has(item.wallet)) {
      mes.porCarteira.set(item.wallet, {
        inicio: 0,
        fim: 0
      })
    }

    const carteira =
      mes.porCarteira.get(item.wallet)

    if (item.snapshot_type === 'inicio') {
      carteira.inicio += total
    }

    if (item.snapshot_type === 'fim') {
      carteira.fim += total
    }
  })

  return meses
})

const mesesDisponiveis = computed(() => {
  return Array
    .from(agregadosMensais.value.keys())
    .sort((a, b) =>
      a < b ? 1 : -1
    )
})

const opcoesDeMes = computed(() => {
  return mesesDisponiveis.value.map(
    mes => ({
      value: mes,
      label: formatarMes(mes)
    })
  )
})

watch(
  mesesDisponiveis,
  meses => {
    if (
      !mesSelecionado.value &&
      meses.length
    ) {
      mesSelecionado.value = meses[0]
    }

    if (
      mesSelecionado.value &&
      !meses.includes(mesSelecionado.value)
    ) {
      mesSelecionado.value =
        meses[0] || ''
    }
  },
  {
    immediate: true
  }
)

const kpis = computed(() => {
  const mes =
    agregadosMensais.value.get(
      mesSelecionado.value
    )

  if (!mes) {
    return {
      inicio: 0,
      fim: 0,
      variacao: 0
    }
  }

  return {
    inicio: mes.inicio,
    fim: mes.fim,
    variacao:
      mes.fim - mes.inicio
  }
})

const totalBaixado = computed(() => {
  return (
    kpis.value.inicio -
    kpis.value.fim
  )
})

const chaveMesAnterior = computed(() => {
  const indice =
    mesesDisponiveis.value.indexOf(
      mesSelecionado.value
    )

  if (
    indice < 0 ||
    indice + 1 >= mesesDisponiveis.value.length
  ) {
    return null
  }

  return mesesDisponiveis.value[indice + 1]
})

const comparacaoAnterior = computed(() => {
  if (!chaveMesAnterior.value) {
    return null
  }

  const mesAnterior =
    agregadosMensais.value.get(
      chaveMesAnterior.value
    )

  if (!mesAnterior) {
    return null
  }

  const baixadoAnterior =
    mesAnterior.inicio -
    mesAnterior.fim

  return {
    rotulo:
      formatarMes(chaveMesAnterior.value),

    diferenca:
      totalBaixado.value -
      baixadoAnterior
  }
})

const detalhamentoPorCarteira = computed(() => {
  const mes =
    agregadosMensais.value.get(
      mesSelecionado.value
    )

  if (!mes) {
    return []
  }

  return CARTEIRAS
    .map(carteira => {
      const valores =
        mes.porCarteira.get(carteira) || {
          inicio: 0,
          fim: 0
        }

      return {
        carteira,
        inicio: valores.inicio,
        fim: valores.fim,

        variacao:
          valores.fim -
          valores.inicio,

        baixado:
          valores.inicio -
          valores.fim
      }
    })
    .filter(linha =>
      linha.inicio !== 0 ||
      linha.fim !== 0
    )
})

const tendenciaMensal = computed(() => {
  const meses = Array
    .from(agregadosMensais.value.keys())
    .sort()
    .slice(-12)

  return {
    labels:
      meses.map(formatarMesCurto),

    inicio:
      meses.map(
        mes =>
          agregadosMensais.value
            .get(mes)
            .inicio
      ),

    fim:
      meses.map(
        mes =>
          agregadosMensais.value
            .get(mes)
            .fim
      )
  }
})

function destruirGrafico() {
  if (grafico) {
    grafico.destroy()
    grafico = null
  }
}

function renderizarGrafico() {
  if (!graficoCanvas.value) {
    return
  }

  destruirGrafico()

  grafico = new Chart(
    graficoCanvas.value,
    {
      type: 'bar',

      data: {
        labels:
          tendenciaMensal.value.labels,

        datasets: [
          {
            label: 'Início',

            data:
              tendenciaMensal.value.inicio,

            backgroundColor:
              '#7fb6e3',

            borderRadius: 5
          },

          {
            label: 'Fim',

            data:
              tendenciaMensal.value.fim,

            backgroundColor:
              '#6fe3a0',

            borderRadius: 5
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: 'index',
          intersect: false
        },

        plugins: {
          legend: {
            labels: {
              color: '#eef4ee',
              usePointStyle: true
            }
          },

          tooltip: {
            callbacks: {
              label(context) {
                return `${
                  context.dataset.label
                }: ${formatarMoeda(
                  context.raw
                )}`
              }
            }
          }
        },

        scales: {
          x: {
            ticks: {
              color: '#eef4ee'
            },

            grid: {
              color:
                'rgba(255, 255, 255, 0.05)'
            }
          },

          y: {
            beginAtZero: true,

            ticks: {
              color: '#eef4ee',

              callback(valor) {
                return Number(valor)
                  .toLocaleString(
                    'pt-BR',
                    {
                      notation: 'compact'
                    }
                  )
              }
            },

            grid: {
              color:
                'rgba(255, 255, 255, 0.06)'
            }
          }
        }
      }
    }
  )
}

async function baixarPdf() {
  if (!mesSelecionado.value) {
    mensagemPdf.value =
      'Selecione um mês antes de gerar o PDF.'

    return
  }

  if (!detalhamentoPorCarteira.value.length) {
    mensagemPdf.value =
      'Não existem lançamentos neste mês.'

    return
  }

  gerandoPdf.value = true
  mensagemPdf.value = ''

  try {
    await nextTick()

    const elemento =
      document.getElementById(
        'relatorio-mensal-pdf'
      )

    if (!elemento) {
      throw new Error(
        'Relatório mensal não encontrado.'
      )
    }

    const canvas = await html2canvas(
      elemento,
      {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      }
    )

    const imagem =
      canvas.toDataURL(
        'image/png',
        1
      )

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const larguraPagina =
      pdf.internal.pageSize.getWidth()

    const alturaPagina =
      pdf.internal.pageSize.getHeight()

    const margem = 8

    const larguraDisponivel =
      larguraPagina - margem * 2

    const alturaDisponivel =
      alturaPagina - margem * 2

    const proporcao = Math.min(
      larguraDisponivel / canvas.width,
      alturaDisponivel / canvas.height
    )

    const larguraImagem =
      canvas.width * proporcao

    const alturaImagem =
      canvas.height * proporcao

    pdf.addImage(
      imagem,
      'PNG',
      (
        larguraPagina -
        larguraImagem
      ) / 2,
      (
        alturaPagina -
        alturaImagem
      ) / 2,
      larguraImagem,
      alturaImagem,
      undefined,
      'FAST'
    )

    pdf.save(
      `comparativo-mensal-${mesSelecionado.value}.pdf`
    )
  } catch (error) {
    console.error(
      'Erro ao gerar PDF:',
      error
    )

    mensagemPdf.value =
      'Não foi possível gerar o relatório em PDF.'
  } finally {
    gerandoPdf.value = false
  }
}

watch(
  tendenciaMensal,
  async () => {
    await nextTick()
    renderizarGrafico()
  },
  {
    deep: true
  }
)

onMounted(async () => {
  await carregarDados()
  await nextTick()
  renderizarGrafico()
})

onBeforeUnmount(() => {
  destruirGrafico()
})
</script>

<style scoped>
.mensal-page {
  --panel: #101d16;
  --panel-raised: #16261c;
  --line: rgba(255, 255, 255, 0.08);
  --paper: #eef4ee;
  --paper-dim: rgba(238, 244, 238, 0.62);
  --jade: #6fe3a0;
  --jade-dim: rgba(111, 227, 160, 0.16);
  --steel: #7fb6e3;
  --good: #6fe3a0;
  --bad: #ff9797;
  --radius: 0.9rem;
  --gap: 1.25rem;

  display: grid;
  gap: 1.5rem;

  width: 100%;
  box-sizing: border-box;

  color: var(--paper);

  font-family:
    'Inter',
    system-ui,
    sans-serif;
}

.mensal-page h1,
.mensal-page h2,
.mensal-page h3 {
  margin: 0;

  font-family:
    'Space Grotesk',
    'Inter',
    sans-serif;

  font-weight: 600;
}

.mensal-page strong {
  font-family:
    'IBM Plex Mono',
    ui-monospace,
    monospace;

  font-variant-numeric:
    tabular-nums;
}

.page-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
}

.eyebrow {
  margin: 0 0 0.35rem;

  color: var(--jade);

  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-header h1 {
  font-size:
    clamp(1.5rem, 2.4vw, 2rem);
}

.page-subtitle {
  max-width: 680px;

  margin: 0.5rem 0 0;

  color: var(--paper-dim);
  line-height: 1.5;
}

.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  padding: 1rem 1.2rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel);
}

.field {
  display: grid;
  gap: 0.35rem;

  width: 14rem;

  color: var(--paper-dim);
  font-size: 0.85rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  border: none;
  border-radius: 0.7rem;

  padding: 0.75rem 1.1rem;

  font-family: inherit;
  font-weight: 600;

  cursor: pointer;
}

.btn--pdf {
  border:
    1px solid rgba(111, 227, 160, 0.32);

  background:
    rgba(111, 227, 160, 0.1);

  color: var(--jade);
}

.btn--pdf:hover:not(:disabled) {
  background:
    rgba(111, 227, 160, 0.17);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.error-banner {
  margin: 0;
  padding: 0.9rem 1.1rem;

  border:
    1px solid rgba(255, 148, 148, 0.35);

  border-radius: 0.7rem;

  background:
    rgba(255, 148, 148, 0.1);

  color: var(--bad);
}

.loading-card {
  display: flex;
  align-items: center;
  gap: 1rem;

  padding: 1.2rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel);
}

.loading-card p {
  margin: 0.3rem 0 0;
  color: var(--paper-dim);
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  flex: 0 0 1.5rem;

  border:
    3px solid rgba(111, 227, 160, 0.2);

  border-top-color: var(--jade);
  border-radius: 50%;

  animation:
    spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.monthly-report {
  display: grid;
  gap: 1.25rem;

  padding: 1.5rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel-raised);
}

.kpi-grid {
  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(180px, 1fr)
    );

  gap: var(--gap);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  padding: 1.1rem 1.25rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel);
}

.kpi-card span {
  color: var(--paper-dim);
  font-size: 0.82rem;
}

.kpi-card strong {
  font-size: 1.3rem;
}

.kpi-card--good strong {
  color: var(--good);
}

.kpi-card--bad strong {
  color: var(--bad);
}

.chart-card,
.table-card {
  padding: 1.2rem 1.3rem;

  border: 1px solid var(--line);
  border-radius: var(--radius);

  background: var(--panel);
}

.chart-card__header,
.table-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.chart-card__hint,
.table-card__header p {
  margin: 0.3rem 0 1rem;

  color: var(--paper-dim);
  font-size: 0.82rem;
}

.month-tag {
  padding: 0.35rem 0.7rem;

  border-radius: 999px;

  background: var(--jade-dim);
  color: var(--jade);

  font-size: 0.75rem;
  font-weight: 700;
}

.chart-wrap {
  position: relative;
  width: 100%;
  height: 310px;
}

.conf-table {
  overflow: hidden;

  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.conf-table__row {
  display: grid;

  grid-template-columns:
    1.25fr repeat(4, 1fr);

  gap: 0.75rem;
  align-items: center;

  padding: 0.75rem 1rem;

  border-top: 1px solid var(--line);

  font-size: 0.84rem;
}

.conf-table__row:first-child {
  border-top: none;
}

.conf-table__row--head {
  color: var(--paper-dim);

  background:
    rgba(255, 255, 255, 0.03);

  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.conf-table__row span {
  color: var(--paper-dim);
}

.wallet-name {
  color: var(--paper);
}

.delta--good {
  color: var(--good);
}

.delta--bad {
  color: var(--bad);
}

.info-message {
  margin: 0;
  padding: 0.9rem 1.1rem;

  border-left: 3px solid var(--steel);
  border-radius: 0.8rem;

  background:
    rgba(255, 255, 255, 0.05);

  color: var(--paper-dim);
}

@media (max-width: 900px) {
  .conf-table__row {
    grid-template-columns:
      1.2fr repeat(2, 1fr);
  }

  .conf-table__row > :nth-child(4),
  .conf-table__row > :nth-child(5) {
    display: none;
  }
}

@media (max-width: 720px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .field,
  .toolbar .btn {
    width: 100%;
    box-sizing: border-box;
  }

  .monthly-report {
    padding: 1rem;
  }

  .chart-wrap {
    height: 240px;
  }

  .conf-table__row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .conf-table__row--head {
    display: none;
  }

  .conf-table__row > :nth-child(4),
  .conf-table__row > :nth-child(5) {
    display: block;
  }
}

.monthly-pdf-render-area {
  position: fixed;
  left: -100000px;
  top: 0;
  width: 1200px;
  pointer-events: none;
}

.monthly-pdf-document {
  width: 1200px;
  min-height: 720px;
  padding: 48px;
  box-sizing: border-box;
  background: #ffffff;
  color: #17231c;
  font-family: Arial, Helvetica, sans-serif;
}

.monthly-pdf-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
}

.monthly-pdf-header h1 {
  margin: 4px 0 8px;
  color: #102018;
  font-size: 34px;
}

.monthly-pdf-header p {
  margin: 0;
  color: #607067;
}

.monthly-pdf-eyebrow {
  margin: 0;
  color: #2f9d61 !important;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.monthly-pdf-meta {
  min-width: 250px;
  padding: 18px 20px;
  border: 1px solid #dce7df;
  border-radius: 14px;
  background: #f5f9f6;
}

.monthly-pdf-meta span,
.monthly-pdf-meta small {
  display: block;
  color: #718077;
  font-size: 12px;
}

.monthly-pdf-meta strong {
  display: block;
  margin: 5px 0;
  color: #15251c;
  font-size: 18px;
}

.monthly-pdf-rule {
  height: 3px;
  margin: 28px 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #61d995, #2f9d61);
}

.monthly-pdf-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.monthly-pdf-kpis article {
  padding: 17px;
  border: 1px solid #dce7df;
  border-radius: 12px;
  background: #f8faf9;
}

.monthly-pdf-kpis span {
  display: block;
  margin-bottom: 8px;
  color: #718077;
  font-size: 12px;
}

.monthly-pdf-kpis strong {
  color: #14241b;
  font-size: 19px;
}

.monthly-pdf-kpis .pdf-good {
  border-color: #b8e7cb;
  background: #eefaf3;
}

.monthly-pdf-kpis .pdf-bad {
  border-color: #f1c3c3;
  background: #fff4f4;
}

.monthly-pdf-table-card {
  overflow: hidden;
  border: 1px solid #dce7df;
  border-radius: 14px;
}

.monthly-pdf-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #f5f9f6;
}

.monthly-pdf-section-title h2 {
  margin: 3px 0 0;
  font-size: 20px;
}

.monthly-pdf-section-title > span {
  color: #718077;
  font-size: 12px;
}

.monthly-pdf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.monthly-pdf-table th,
.monthly-pdf-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e6eee9;
  text-align: right;
}

.monthly-pdf-table th {
  background: #102018;
  color: #ffffff;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.monthly-pdf-table th:first-child,
.monthly-pdf-table td:first-child {
  text-align: left;
}

.monthly-pdf-table tbody tr:nth-child(even) {
  background: #f8faf9;
}

.pdf-good-text {
  color: #238653;
  font-weight: 700;
}

.pdf-bad-text {
  color: #c94d4d;
  font-weight: 700;
}

.monthly-pdf-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid #dce7df;
  color: #718077;
  font-size: 11px;
}



/* ============================================================
   RESPONSIVIDADE — COMPARATIVO MENSAL
   ============================================================ */
.mensal-page,
.toolbar,
.monthly-report,
.kpi-grid,
.chart-card,
.chart-wrap,
.table-card,
.conf-table {
  min-width: 0;
}

.chart-wrap canvas {
  display: block;
  max-width: 100%;
}

@media (max-width: 1100px) {
  .mensal-page {
    padding: 1.5rem clamp(1rem, 2.5vw, 1.5rem);
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .toolbar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .toolbar .field,
  .toolbar .btn {
    width: 100%;
  }

  .chart-card__header,
  .table-card__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }

  .month-tag {
    align-self: flex-start;
  }

  .conf-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .conf-table__row {
    min-width: 760px;
  }
}

@media (max-width: 560px) {
  .mensal-page {
    padding: 1rem 0.75rem 1.5rem;
  }

  .page-header h1 {
    font-size: clamp(1.7rem, 8vw, 2.1rem);
  }

  .page-subtitle {
    font-size: 0.86rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .kpi-card,
  .chart-card,
  .table-card {
    padding: 1rem;
  }

  .chart-wrap {
    min-height: 280px;
  }
}
</style>