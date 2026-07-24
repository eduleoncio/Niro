<template>
  <section class="operational">
    <!-- <header class="section-header">
      <div>
        <p class="eyebrow">Controle operacional</p>
        <h2>Abertura e fechamento semanal</h2>
      </div>

      <div
        class="result-chip"
        :class="report.kpis.totalBaixado >= 0
          ? 'result-chip--good'
          : 'result-chip--bad'"
      >
        <span>
          {{ report.kpis.totalBaixado >= 0
            ? 'Total baixado'
            : 'Aumento no saldo' }}
        </span>

        <strong>
          {{ money(Math.abs(report.kpis.totalBaixado)) }}
        </strong>
      </div>
    </header> -->

    <div class="confirmation-banner">
      <div class="confirmation-icon">
        ✓
      </div>

      <div>
        <strong>{{ report.closing.analyst }}</strong>
        confirmou
        <b>{{ money(report.kpis.totalBaixado) }}</b>
        da carteira
        <strong>{{ report.wallet }}</strong>,
        no período de
        {{ date(report.opening.date) }}
        a
        {{ date(report.closing.date) }}.
      </div>
    </div>

    <div class="table-wrapper">
      <table class="operational-table">
        <colgroup>
          <col class="date-column">
          <col class="portfolio-column">

          <col
            v-for="column in report.columns"
            :key="column.id"
            class="value-column"
          >

          <col class="total-column">
        </colgroup>

        <thead>
          <tr class="group-header">
            <th rowspan="2">Data</th>
            <th></th>
            <th colspan="2">10 dias</th>
            <th colspan="2">30 dias</th>
            <th colspan="2">+31 dias</th>
            <th>Minuta</th>
            <th rowspan="2">Total do dia</th>
          </tr>

          <tr class="column-header">
            <th>Carteira</th>

            <th
              v-for="column in report.columns"
              :key="column.id"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- ABERTURA -->
          <tr>
            <td
              class="date-cell"
              rowspan="3"
            >
              <span>Abertura</span>
              <strong>{{ date(report.opening.date) }}</strong>
              <small>{{ report.opening.analyst }}</small>
            </td>

            <td class="portfolio-cell portfolio-cell--factor">
              Factor
            </td>

            <td
              v-for="(value, index) in report.opening.factor.values"
              :key="`opening-factor-${index}`"
              class="money-cell"
            >
              {{ money(value) }}
            </td>

            <td class="money-cell row-total">
              {{ money(report.opening.factor.total) }}
            </td>
          </tr>

          <tr>
            <td class="portfolio-cell portfolio-cell--fidc">
              FIDC
            </td>

            <td
              v-for="(value, index) in report.opening.fidc.values"
              :key="`opening-fidc-${index}`"
              class="money-cell"
            >
              {{ money(value) }}
            </td>

            <td class="money-cell row-total">
              {{ money(report.opening.fidc.total) }}
            </td>
          </tr>

          <tr class="totals-row">
            <td>Totais</td>

            <td
              v-for="(value, index) in report.opening.totals"
              :key="`opening-total-${index}`"
              class="money-cell"
            >
              {{ money(value) }}
            </td>

            <td class="money-cell grand-total">
              {{ money(report.opening.grandTotal) }}
            </td>
          </tr>

          <!-- DIVISOR -->
          <tr class="period-divider">
            <td colspan="10">
              Fechamento semanal
            </td>
          </tr>

          <!-- FECHAMENTO -->
          <tr>
            <td
              class="date-cell date-cell--closing"
              rowspan="3"
            >
              <span>Fechamento</span>
              <strong>{{ date(report.closing.date) }}</strong>
              <small>{{ report.closing.analyst }}</small>
            </td>

            <td class="portfolio-cell portfolio-cell--factor">
              Factor
            </td>

            <td
              v-for="(value, index) in report.closing.factor.values"
              :key="`closing-factor-${index}`"
              class="money-cell"
            >
              {{ money(value) }}
            </td>

            <td class="money-cell row-total">
              {{ money(report.closing.factor.total) }}
            </td>
          </tr>

          <tr>
            <td class="portfolio-cell portfolio-cell--fidc">
              FIDC
            </td>

            <td
              v-for="(value, index) in report.closing.fidc.values"
              :key="`closing-fidc-${index}`"
              class="money-cell"
            >
              {{ money(value) }}
            </td>

            <td class="money-cell row-total">
              {{ money(report.closing.fidc.total) }}
            </td>
          </tr>

          <tr class="totals-row">
            <td>Totais</td>

            <td
              v-for="(value, index) in report.closing.totals"
              :key="`closing-total-${index}`"
              class="money-cell"
            >
              {{ money(value) }}
            </td>

            <td class="money-cell grand-total">
              {{ money(report.closing.grandTotal) }}
            </td>
          </tr>

          <!-- RESULTADO -->
          <tr
            class="downloaded-row"
            :class="report.kpis.totalBaixado >= 0
              ? 'downloaded-row--good'
              : 'downloaded-row--bad'"
          >
            <td colspan="9">
              <span>
                {{ report.kpis.totalBaixado >= 0
                  ? 'Total baixado da semana'
                  : 'Aumento registrado na semana' }}
              </span>

              <small>
                {{ percentageText }}
              </small>
            </td>

            <td>
              {{ money(Math.abs(report.kpis.totalBaixado)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="summary-strip">
      <article>
        <span>Factor</span>
        <strong
          :class="variationClass(report.resumo.variacaoFactor)"
        >
          {{ signedMoney(report.resumo.variacaoFactor) }}
        </strong>
      </article>

      <article>
        <span>FIDC</span>
        <strong
          :class="variationClass(report.resumo.variacaoFidc)"
        >
          {{ signedMoney(report.resumo.variacaoFidc) }}
        </strong>
      </article>

      <article>
        <span>Resultado geral</span>
        <strong
          :class="report.kpis.totalBaixado >= 0
            ? 'value-good'
            : 'value-bad'"
        >
          {{ money(Math.abs(report.kpis.totalBaixado)) }}
        </strong>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

const percentageText = computed(() => {
  const percentage = Math.abs(
    Number(props.report.kpis.percentage || 0)
  ).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return props.report.kpis.totalBaixado >= 0
    ? `Redução de ${percentage}% em relação à abertura`
    : `Aumento de ${percentage}% em relação à abertura`
})

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function signedMoney(value) {
  const number = Number(value || 0)
  const prefix = number > 0 ? '+' : ''

  return `${prefix}${money(number)}`
}

function date(value) {
  if (!value) return '—'

  const parts = String(value).split('-')

  return parts.length === 3
    ? parts.reverse().join('/')
    : value
}

function variationClass(value) {
  return Number(value || 0) <= 0
    ? 'value-good'
    : 'value-bad'
}
</script>

<style scoped>
.operational {
  overflow: hidden;
  border: 1px solid #dce5dd;
  border-radius: 16px;
  background: #ffffff;
  break-inside: avoid;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 20px;
  border-bottom: 1px solid #dce5dd;
  background: #f7faf8;
}

.eyebrow {
  margin: 0 0 5px;
  color: #27905a;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.7px;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #102219;
  font-size: 18px;
  font-weight: 700;
}

.result-chip {
  min-width: 190px;
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 12px;
  text-align: right;
}

.result-chip span {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.result-chip strong {
  display: block;
  font-size: 21px;
  font-variant-numeric: tabular-nums;
}

.result-chip--good {
  border-color: #a9e8c2;
  background: #eafaf0;
  color: #166d3c;
}

.result-chip--bad {
  border-color: #f4bcbc;
  background: #fff0f0;
  color: #b33131;
}

.confirmation-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-bottom: 1px solid #dce5dd;
  background: #163d28;
  color: #eef7f1;
  font-size: 14px;
  line-height: 1.5;
}

.confirmation-banner strong,
.confirmation-banner b {
  color: #89efb2;
}

.confirmation-icon {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  border-radius: 50%;
  background: #6fe3a0;
  color: #0a2918;
  font-weight: 900;
}

.table-wrapper {
  overflow: hidden;
}

.operational-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  color: #243029;
  font-size: 10px;
}

.date-column {
  width: 105px;
}

.portfolio-column {
  width: 72px;
}

.value-column {
  width: 110px;
}

.total-column {
  width: 125px;
}

.operational-table th,
.operational-table td {
  border-right: 1px solid #dce5dd;
  border-bottom: 1px solid #dce5dd;
  vertical-align: middle;
}

.operational-table th:last-child,
.operational-table td:last-child {
  border-right: 0;
}

.group-header th {
  padding: 10px 5px;
  background: #dce9df;
  color: #274133;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-align: center;
  text-transform: uppercase;
}

.column-header th {
  padding: 8px 5px;
  background: #eef4ef;
  color: #4b5b51;
  font-size: 9px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
}

.date-cell {
  padding: 12px 8px;
  background: #ecf9f0;
  color: #163d28;
  text-align: center;
}

.date-cell--closing {
  background: #edf4fa;
  color: #214861;
}

.date-cell span,
.date-cell strong,
.date-cell small {
  display: block;
}

.date-cell span {
  margin-bottom: 5px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.date-cell strong {
  font-size: 12px;
}

.date-cell small {
  margin-top: 5px;
  color: #67756c;
  font-size: 8px;
  line-height: 1.25;
}

.portfolio-cell {
  padding: 12px 6px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
}

.portfolio-cell--factor {
  background: #fff7e9;
  color: #976515;
}

.portfolio-cell--fidc {
  background: #ebfaf1;
  color: #23784a;
}

.money-cell {
  padding: 11px 5px;
  background: #ffffff;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.row-total {
  background: #f4f7f5;
  color: #17271e;
  font-weight: 800;
}

.totals-row td {
  padding: 11px 5px;
  background: #e9f5ed;
  color: #1d5536;
  font-weight: 800;
  text-align: right;
}

.totals-row td:first-child {
  text-align: center;
  text-transform: uppercase;
}

.grand-total {
  background: #d8efdf !important;
  color: #124e2d !important;
  font-size: 10px;
}

.period-divider td {
  padding: 9px;
  border-top: 2px solid #4b8e68;
  border-bottom: 2px solid #4b8e68;
  background: #244b35;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-align: center;
  text-transform: uppercase;
}

.downloaded-row td {
  padding: 14px 12px;
  border-bottom: 0;
  font-size: 13px;
  font-weight: 800;
}

.downloaded-row td:first-child {
  text-align: right;
}

.downloaded-row td:last-child {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.downloaded-row span,
.downloaded-row small {
  display: block;
}

.downloaded-row small {
  margin-top: 3px;
  font-size: 9px;
  font-weight: 600;
  opacity: 0.78;
}

.downloaded-row--good td {
  background: #2e8452;
  color: #ffffff;
}

.downloaded-row--bad td {
  background: #b74242;
  color: #ffffff;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #dce5dd;
  background: #fafcfb;
}

.summary-strip article {
  padding: 14px 18px;
  border-right: 1px solid #dce5dd;
}

.summary-strip article:last-child {
  border-right: 0;
}

.summary-strip span {
  display: block;
  margin-bottom: 4px;
  color: #6d7871;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.summary-strip strong {
  display: block;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.value-good {
  color: #19834a;
}

.value-bad {
  color: #c44040;
}

.operational {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>