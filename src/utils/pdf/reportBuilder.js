const COLUMNS = [
  {
    id: 'falta10',
    group: '10 dias',
    label: 'Falta Canhoto',
    keyBase: 'Falta Canhoto',
    suffix: '10 Dias'
  },
  {
    id: 'recebido10',
    group: '10 dias',
    label: 'C/ Recebido',
    keyBase: 'Falta Canhoto Canhoto Recebido',
    suffix: '10 Dias'
  },
  {
    id: 'falta30',
    group: '30 dias',
    label: 'Falta Canhoto',
    keyBase: 'Falta Canhoto',
    suffix: '30 Dias'
  },
  {
    id: 'recebido30',
    group: '30 dias',
    label: 'C/ Recebido',
    keyBase: 'Falta Canhoto Canhoto Recebido',
    suffix: '30 Dias'
  },
  {
    id: 'falta31',
    group: '+31 dias',
    label: 'Falta Canhoto',
    keyBase: 'Falta Canhoto',
    suffix: '31+ Dias'
  },
  {
    id: 'recebido31',
    group: '+31 dias',
    label: 'C/ Recebido',
    keyBase: 'Falta Canhoto Canhoto Recebido',
    suffix: '31+ Dias'
  },
  {
    id: 'minuta',
    group: 'Minuta',
    label: 'Geral',
    keyBase: 'Minuta',
    suffix: null
  }
]

function numberValue(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

function sumValues(values = []) {
  return values.reduce((total, value) => total + numberValue(value), 0)
}

function categoryKey(portfolio, column) {
  if (column.suffix) {
    return `${column.keyBase} - ${portfolio} - ${column.suffix} - Geral`
  }

  return `${column.keyBase} - ${portfolio} - Geral`
}

function buildPortfolioRow(snapshot, portfolio) {
  const source = portfolio === 'FIDC'
    ? snapshot?.fidc
    : snapshot?.factor

  const values = COLUMNS.map(column =>
    numberValue(source?.[categoryKey(portfolio, column)])
  )

  return {
    portfolio,
    values,
    total: sumValues(values)
  }
}

function buildPeriod(snapshot) {
  if (!snapshot) return null

  const factor = buildPortfolioRow(snapshot, 'Factor')
  const fidc = buildPortfolioRow(snapshot, 'FIDC')

  const totals = COLUMNS.map((_, index) =>
    numberValue(factor.values[index]) + numberValue(fidc.values[index])
  )

  return {
    date: snapshot.captured_at || '',
    analyst: snapshot.analyst_name || 'Não informado',
    factor,
    fidc,
    totals,
    grandTotal: sumValues(totals)
  }
}

function calculatePercentage(startValue, endValue) {
  const start = numberValue(startValue)

  if (start === 0) return 0

  return ((numberValue(endValue) - start) / start) * 100
}

function normalizeRows(rows = [], portfolio) {
  return rows.map(row => ({
    ...row,
    portfolio: row.portfolio || portfolio
  }))
}

function buildExecutiveSummary({
  wallet,
  opening,
  closing,
  totalBaixado,
  percentage,
  biggestDrop,
  biggestRise,
  alerts
}) {
  const direction = totalBaixado >= 0 ? 'redução' : 'aumento'
  const absoluteTotal = Math.abs(totalBaixado)

  const phrases = [
    `A carteira ${wallet} encerrou a semana com ${direction} de ${formatCurrency(
      absoluteTotal
    )} no volume de recebíveis.`,
    `A variação percentual do período foi de ${Math.abs(percentage).toFixed(2)}%.`
  ]

  if (biggestDrop) {
    phrases.push(
      `A maior baixa ocorreu em ${cleanCategoryName(
        biggestDrop.key
      )}, na carteira ${biggestDrop.portfolio}.`
    )
  }

  if (biggestRise?.delta > 0) {
    phrases.push(
      `O maior aumento ocorreu em ${cleanCategoryName(
        biggestRise.key
      )}, no valor de ${formatCurrency(biggestRise.delta)}.`
    )
  }

  if (alerts.length) {
    phrases.push(
      `${alerts.length} ${
        alerts.length === 1 ? 'categoria crítica apresentou' : 'categorias críticas apresentaram'
      } crescimento e requer atenção.`
    )
  } else {
    phrases.push('Nenhuma categoria crítica apresentou crescimento no período.')
  }

  if (!opening || !closing) {
    return 'Não existem dados suficientes para montar o resumo executivo.'
  }

  return phrases.join(' ')
}

export function cleanCategoryName(key = '') {
  return String(key)
    .replace(/\s*-\s*(FIDC|Factor)\s*/gi, ' - ')
    .replace(/\s*-\s*Geral\s*$/i, '')
    .replace(/Falta Canhoto Canhoto Recebido/gi, 'Canhoto Recebido')
    .replace(/\s+-\s+/g, ' - ')
    .trim()
}

export function formatCurrency(value) {
  return numberValue(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function formatDate(dateString) {
  if (!dateString) return '—'

  const parts = String(dateString).split('-')

  if (parts.length !== 3) return dateString

  return parts.reverse().join('/')
}

export function buildPdfReport(reportComparison) {
  if (!reportComparison?.inicio || !reportComparison?.fim) {
    throw new Error(
      'O relatório precisa possuir uma contagem de início e uma contagem de fim.'
    )
  }

  const opening = buildPeriod(reportComparison.inicio)
  const closing = buildPeriod(reportComparison.fim)

  const totalBaixado = opening.grandTotal - closing.grandTotal
  const rawDelta = closing.grandTotal - opening.grandTotal

  const percentage = calculatePercentage(
    opening.grandTotal,
    closing.grandTotal
  )

  const fidcRows = normalizeRows(reportComparison.fidcRows, 'FIDC')
  const factorRows = normalizeRows(reportComparison.factorRows, 'Factor')

  const ranking = [...fidcRows, ...factorRows]
    .sort((a, b) => a.delta - b.delta)

  const alerts = (
    reportComparison.alertas ||
    ranking.filter(row => row.alerta)
  ).map(alert => ({
    ...alert,
    portfolio: alert.portfolio || 'Não informado'
  }))

  const biggestDrop =
    reportComparison.biggestDrop ||
    ranking.find(row => row.delta < 0) ||
    null

  const biggestRise =
    reportComparison.biggestRise ||
    [...ranking].sort((a, b) => b.delta - a.delta)[0] ||
    null

  const report = {
    wallet: reportComparison.wallet,
    week: reportComparison.weekLabel,
    weekStart: reportComparison.weekStart,

    analyst:
      reportComparison.emittedBy ||
      reportComparison.fim.analyst_name ||
      'Não informado',

    emittedAt:
      reportComparison.emittedAt ||
      new Date().toLocaleString('pt-BR'),

    opening,
    closing,

    columns: COLUMNS,

    kpis: {
      startTotal: opening.grandTotal,
      endTotal: closing.grandTotal,

      // end - start: usado para indicar a variação contábil.
      delta: rawDelta,

      // start - end: quanto efetivamente baixou.
      totalBaixado,

      percentage,

      walletsCompletas: 1,
      walletsTotal: 1
    },

    resumo: {
      aberturaFactor: opening.factor.total,
      fechamentoFactor: closing.factor.total,
      variacaoFactor: closing.factor.total - opening.factor.total,

      aberturaFidc: opening.fidc.total,
      fechamentoFidc: closing.fidc.total,
      variacaoFidc: closing.fidc.total - opening.fidc.total,

      aberturaTotal: opening.grandTotal,
      fechamentoTotal: closing.grandTotal,
      totalBaixado
    },

    ranking,

    alerts,

    biggestDrop,

    biggestRise
  }

  report.executiveSummary = buildExecutiveSummary({
    wallet: report.wallet,
    opening,
    closing,
    totalBaixado,
    percentage,
    biggestDrop,
    biggestRise,
    alerts
  })

  return report
}