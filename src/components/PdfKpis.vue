<template>
  <section class="grid">
    <article class="card card--start">
      <span>Total inicial</span>
      <strong>{{ money(report.kpis.startTotal) }}</strong>
      <small>Abertura da semana</small>
    </article>

    <article class="card card--end">
      <span>Total final</span>
      <strong>{{ money(report.kpis.endTotal) }}</strong>
      <small>Fechamento da semana</small>
    </article>

    <article
      class="card"
      :class="report.kpis.totalBaixado >= 0
        ? 'card--good'
        : 'card--bad'"
    >
      <span>
        {{ report.kpis.totalBaixado >= 0
          ? 'Total baixado'
          : 'Aumento no saldo' }}
      </span>

      <strong>
        {{ money(Math.abs(report.kpis.totalBaixado)) }}
      </strong>

      <small>
        {{ percentage }}
      </small>
    </article>

    <article class="card card--status">
      <span>Status</span>
      <strong>
        {{ report.kpis.totalBaixado >= 0
          ? 'Redução'
          : 'Atenção' }}
      </strong>
      <small>Comparação semanal</small>
    </article>
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

const percentage = computed(() => {
  const value = Math.abs(
    Number(props.report.kpis.percentage || 0)
  ).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return `${value}% em relação ao início`
})

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  break-inside: avoid;
}

.card {
  min-height: 92px;
  padding: 17px 18px;
  border: 1px solid #dce5dd;
  border-top: 4px solid #7fb6e3;
  border-radius: 13px;
  background: #f7faf8;
}

.card span,
.card small {
  display: block;
}

.card span {
  color: #637068;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.card strong {
  display: block;
  margin: 8px 0 5px;
  color: #15241b;
  font-size: 21px;
  font-variant-numeric: tabular-nums;
}

.card small {
  color: #7a867e;
  font-size: 9px;
}

.card--start {
  border-top-color: #7fb6e3;
}

.card--end {
  border-top-color: #eab766;
}

.card--good {
  border-color: #a8e3be;
  border-top-color: #38a665;
  background: #edfaf2;
}

.card--good strong {
  color: #177341;
}

.card--bad {
  border-color: #efb6b6;
  border-top-color: #d74d4d;
  background: #fff1f1;
}

.card--bad strong {
  color: #b62f2f;
}

.card--status {
  border-top-color: #8876c7;
}
</style>