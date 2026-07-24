<template>
  <section class="rastrear-page">

    <!-- ===== Access gates ===== -->
    <div v-if="!session" class="access-gate">
      <p class="eyebrow">Acesso restrito</p>
      <h2>Você precisa estar logado para ver esta página.</h2>
      <RouterLink class="btn btn--primary" to="/login">Ir para o login</RouterLink>
    </div>

    <div v-else-if="accessChecked && accessDenied" class="access-gate">
      <p class="eyebrow">Acesso restrito</p>
      <h2>Este e-mail não tem permissão para o controle de recebíveis.</h2>
      <p class="page-subtitle">Fale com a Eliane ou com o administrador do sistema para liberar seu acesso.</p>
    </div>

    <template v-else-if="currentUser">
      <!-- ===== Header ===== -->
      <header class="page-header">
        <div class="page-header__text">
          <p class="eyebrow">Controle semanal de canhotos · 2026</p>
          <h1>Confirmação — Resultados</h1>
          <p class="page-subtitle">Lance os valores no início da semana e novamente no fim.</p>
        </div>

        <div class="header-actions">
          <div class="dropdown" ref="equipeDropdownRef">
            <button
              type="button"
              class="dropdown__trigger"
              :aria-expanded="equipeOpen"
              @click.stop="equipeOpen = !equipeOpen"
            >
              <span>Equipe</span>

              <svg
                class="dropdown__chevron"
                :class="{ 'dropdown__chevron--open': equipeOpen }"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div
              v-if="equipeOpen"
              class="dropdown__panel"
              @click.stop
            >
              <RouterLink
                v-for="pessoa in teamRoster"
                :key="pessoa.email"
                class="dropdown__option--button"
                :to="{
                  name: 'dashboard-perfil-equipe',
                  params: { email: pessoa.email }
                }"
                @click="equipeOpen = false"
              >
                <span>{{ pessoa.name }}</span>

                <span
                  v-if="pessoa.email === currentUser.email"
                  class="dropdown__option-tag"
                >
                  você
                </span>
              </RouterLink>
            </div>
          </div>

          <RouterLink
            class="user-badge"
            :class="`user-badge--${currentUser.role}`"
            :to="{
              name: 'dashboard-perfil-equipe',
              params: { email: currentUser.email }
            }"
          >
            <span>{{ currentUser.name }}</span>
            <small>{{ roleLabel }}</small>
          </RouterLink>
        </div>
      </header>

      <!-- ===== Wallet + week status ===== -->
      <section class="week-bar">
        <label class="field field--sm">
          <span>Carteira</span>
          <select v-model="selectedWallet" class="field__select">
            <optgroup label="Carteiras" v-if="!isSupervisor || realWalletOptions.length">
              <option v-for="name in realWalletOptions" :key="name" :value="name">{{ name }}</option>
            </optgroup>
            <optgroup label="Conferência" v-if="isSupervisor">
              <option :value="GERAL_WALLET">{{ GERAL_WALLET }}</option>
            </optgroup>
          </select>
        </label>
        <p v-if="!isSupervisor && !realWalletOptions.length" class="error-banner">
          Nenhuma carteira atribuída ao seu usuário ainda. Fale com a Eliane.
        </p>

        <label class="field field--sm">
          <span>Data desta contagem</span>
          <input type="date" v-model="entryDate" />
        </label>

        <div class="week-bar__status">
          <span class="week-bar__label">{{ weekLabel }}</span>
          <div class="status-pills">
            <span class="status-pill" :class="weekStatus.inicio ? 'status-pill--done' : 'status-pill--pending'">
              Início {{ weekStatus.inicio ? `· ${weekStatus.inicio.analyst_name}
              (${formatDate(weekStatus.inicio.captured_at)})` : '· pendente' }}
            </span>
            <span class="status-pill" :class="weekStatus.fim ? 'status-pill--done' : 'status-pill--pending'">
              Fim {{ weekStatus.fim ? `· ${weekStatus.fim.analyst_name} (${formatDate(weekStatus.fim.captured_at)})` :
                '· pendente' }}
            </span>
          </div>
        </div>

        <div class="dropdown week-bar__weeks" ref="weeksDropdownRef">
          <button type="button" class="dropdown__trigger" @click="weeksOpen = !weeksOpen" :aria-expanded="weeksOpen">
            <span>Ver outra semana</span>
            <svg class="dropdown__chevron" :class="{ 'dropdown__chevron--open': weeksOpen }" width="12" height="12"
              viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <div v-if="weeksOpen" class="dropdown__panel">
            <button v-for="w in availableWeeks" :key="w.weekStart" type="button" class="dropdown__option--button"
              @click="selectWeek(w.weekStart)">
              <span>{{ w.label }}</span>
              <span class="dropdown__option-tag" v-if="w.hasBoth">completa</span>
            </button>
            <p v-if="!availableWeeks.length" class="dropdown__empty">Nenhuma semana salva para esta carteira ainda.</p>
          </div>
        </div>
      </section>

      <p v-if="saveError" class="error-banner">{{ saveError }}</p>

      <!-- ===== Manual entry ledgers ===== -->
      <section class="ledger-grid">
        <article class="ledger-card ledger-card--fidc">
          <header class="ledger-card__head">
            <div class="ledger-card__title">
              <span class="tag tag--fidc">FIDC</span>
              <h2>Fundo de investimento</h2>
            </div>
            <strong class="ledger-total">{{ formatCurrency(fidcTotal) }}</strong>
          </header>
          <div class="ledger-fields">
            <label v-for="(value, key) in fidc" :key="key" class="ledger-field">
              <span>{{ cleanCategoryLabel(key) }}</span>
              <input type="number" step="0.01" v-model="fidc[key]" placeholder="0,00" />
            </label>
          </div>
        </article>

        <article class="ledger-card ledger-card--factor">
          <header class="ledger-card__head">
            <div class="ledger-card__title">
              <span class="tag tag--factor">Factor</span>
              <h2>Factoring</h2>
            </div>
            <strong class="ledger-total">{{ formatCurrency(factorTotal) }}</strong>
          </header>
          <div class="ledger-fields">
            <label v-for="(value, key) in factor" :key="key" class="ledger-field">
              <span>{{ cleanCategoryLabel(key) }}</span>
              <input type="number" step="0.01" v-model="factor[key]" placeholder="0,00" />
            </label>
          </div>
        </article>
      </section>

      <div class="report-actions">
        <button class="btn btn--ghost" @click="editManualInputs" :disabled="!weekStatus.inicio && !weekStatus.fim">
          Editar última contagem
        </button>
        <button class="btn btn--primary" @click="saveManualInputs" :disabled="saving">
          {{ saving ? 'Salvando…' : `Salvar como ${nextSnapshotLabel}` }}
        </button>
        <button class="btn btn--accent" @click="generateReport" :disabled="!canEmitReport">
          Emitir relatório
        </button>
        <button class="btn btn--ghost" @click="baixarPdf" :disabled="!pdfReportData">
          Baixar PDF
        </button>
        <button v-if="selectedWallet === GERAL_WALLET" class="btn btn--accent" @click="gerarConferencia"
          :disabled="!weekStatus.inicio && !weekStatus.fim">
          Emitir conferência
        </button>
        <button
          v-if="selectedWallet === GERAL_WALLET"
          class="btn btn--ghost"
          @click="baixarPdfConferencia"
          :disabled="!conferencia || generatingConferencePdf"
        >
          {{ generatingConferencePdf ? 'Gerando PDF...' : 'Baixar PDF da conferência' }}
        </button>
      </div>

      <!-- ===== Comparison report ===== -->
      <section v-if="showReport && reportComparison" class="report-view">

        <div class="report-summary">
          <div class="report-summary__text">
            <p class="eyebrow">Relatório da semana · {{ selectedWallet }}</p>
            <h3>{{ reportComparison.weekLabel }}</h3>
            <p class="report-summary__date">
              Início: {{ formatDate(reportComparison.inicio.captured_at) }} ({{ reportComparison.inicio.analyst_name }})
              ·
              Fim: {{ formatDate(reportComparison.fim.captured_at) }} ({{ reportComparison.fim.analyst_name }})
            </p>
            <p class="report-summary__date">Emitido por {{ reportComparison.emittedBy }} em {{
              reportComparison.emittedAt }}</p>
          </div>
          <div class="report-summary__metrics">
            <span class="chip">Início <strong>{{ formatCurrency(reportComparison.startTotal) }}</strong></span>
            <span class="chip">Fim <strong>{{ formatCurrency(reportComparison.endTotal) }}</strong></span>
            <span class="chip" :class="reportComparison.totalDelta <= 0 ? 'chip--good' : 'chip--bad'">
              Variação <strong>{{ reportComparison.totalDelta > 0 ? '+' : '' }}{{
                formatCurrency(reportComparison.totalDelta) }}</strong>
            </span>
          </div>
        </div>

        <!-- ===== Destaque + tabela estilo planilha (Factor/Fidc/Totais por data) ===== -->
        <div v-if="spreadsheetBlock" class="sheet-banner">
          <strong>{{ reportComparison.fim.analyst_name }}</strong> confirmou
          <strong class="sheet-banner__value">{{ formatCurrency(spreadsheetBlock.totalBaixado) }}</strong>
          da carteira <strong>{{ reportComparison.wallet }}</strong>, no período de
          {{ formatDate(reportComparison.inicio.captured_at) }} a {{ formatDate(reportComparison.fim.captured_at) }}
        </div>

        <div v-if="spreadsheetBlock" class="sheet-table-wrap">
          <table class="sheet-table">
            <thead>
              <tr>
                <th rowspan="2"></th>
                <th rowspan="2">Tipo</th>
                <th colspan="2">10 dias</th>
                <th colspan="2">30 dias</th>
                <th colspan="2">+31 dias</th>
                <th rowspan="2">Minuta</th>
                <th rowspan="2">Total do dia</th>
              </tr>
              <tr>
                <th>Falta Canhoto</th>
                <th>C/ Recebido</th>
                <th>Falta Canhoto</th>
                <th>C/ Recebido</th>
                <th>Falta Canhoto</th>
                <th>C/ Recebido</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="sheet-table__date" rowspan="3">{{ formatDate(reportComparison.inicio.captured_at) }}</td>
                <td class="sheet-table__row-label">Factor</td>
                <td v-for="(v, i) in spreadsheetBlock.inicio.factor.values" :key="'if' + i">{{ formatCurrency(v) }}</td>
                <td>{{ formatCurrency(spreadsheetBlock.inicio.factor.total) }}</td>
              </tr>
              <tr>
                <td class="sheet-table__row-label">Fidc</td>
                <td v-for="(v, i) in spreadsheetBlock.inicio.fidc.values" :key="'ii' + i">{{ formatCurrency(v) }}</td>
                <td>{{ formatCurrency(spreadsheetBlock.inicio.fidc.total) }}</td>
              </tr>
              <tr class="sheet-table__totais">
                <td>Totais</td>
                <td v-for="(v, i) in spreadsheetBlock.inicio.totals" :key="'it' + i">{{ formatCurrency(v) }}</td>
                <td class="sheet-table__total-dia">{{ formatCurrency(spreadsheetBlock.inicio.totalDoDia) }}</td>
              </tr>
              <tr class="sheet-table__divider">
                <td colspan="10">Fechamento semanal</td>
              </tr>
              <tr>
                <td class="sheet-table__date" rowspan="3">{{ formatDate(reportComparison.fim.captured_at) }}</td>
                <td class="sheet-table__row-label">Factor</td>
                <td v-for="(v, i) in spreadsheetBlock.fim.factor.values" :key="'ff' + i">{{ formatCurrency(v) }}</td>
                <td>{{ formatCurrency(spreadsheetBlock.fim.factor.total) }}</td>
              </tr>
              <tr>
                <td class="sheet-table__row-label">Fidc</td>
                <td v-for="(v, i) in spreadsheetBlock.fim.fidc.values" :key="'fi' + i">{{ formatCurrency(v) }}</td>
                <td>{{ formatCurrency(spreadsheetBlock.fim.fidc.total) }}</td>
              </tr>
              <tr class="sheet-table__totais">
                <td>Totais</td>
                <td v-for="(v, i) in spreadsheetBlock.fim.totals" :key="'ft' + i">{{ formatCurrency(v) }}</td>
                <td class="sheet-table__total-dia">{{ formatCurrency(spreadsheetBlock.fim.totalDoDia) }}</td>
              </tr>
              <tr class="sheet-table__baixado">
                <td colspan="9">Total baixado da semana</td>
                <td>{{ formatCurrency(spreadsheetBlock.totalBaixado) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="highlight-grid">
          <article class="highlight-card highlight-card--good" v-if="reportComparison.biggestDrop">
            <span>Maior queda (mais confirmado)</span>
            <strong>{{ cleanCategoryLabel(reportComparison.biggestDrop.key) }}</strong>
            <small>{{ reportComparison.biggestDrop.portfolio }} · {{ formatCurrency(reportComparison.biggestDrop.delta)
            }}</small>
          </article>
          <article class="highlight-card highlight-card--bad"
            v-if="reportComparison.biggestRise && reportComparison.biggestRise.delta > 0">
            <span>Maior alta (mais subiu)</span>
            <strong>{{ cleanCategoryLabel(reportComparison.biggestRise.key) }}</strong>
            <small>{{ reportComparison.biggestRise.portfolio }} · +{{ formatCurrency(reportComparison.biggestRise.delta)
            }}</small>
          </article>
        </div>

        <div class="alert-banner" v-if="reportComparison.alertas.length">
          <strong>⚠ Atenção — categoria crítica subiu na carteira {{ reportComparison.wallet }}:</strong>
          <ul>
            <li v-for="a in reportComparison.alertas" :key="a.portfolio + a.key">
              {{ a.portfolio }} · {{ cleanCategoryLabel(a.key) }} — subiu {{ formatCurrency(a.delta) }} (deveria ter caído até sexta)
            </li>
          </ul>
        </div>

        <div class="conf-table">
          <div class="conf-table__row conf-table__row--head">
            <span>Categoria</span>
            <span>Carteira</span>
            <span>Início</span>
            <span>Fim</span>
            <span>Variação</span>
          </div>
          <div class="conf-table__group-label">FIDC</div>
          <div v-for="row in reportComparison.fidcRows" :key="'fidc-' + row.key" class="conf-table__row"
            :class="{ 'conf-table__row--alert': row.alerta }">
            <span>{{ cleanCategoryLabel(row.key) }} <em v-if="row.critico" class="conf-table__tag">crítico</em></span>
            <span>FIDC</span>
            <span>{{ formatCurrency(row.start) }}</span>
            <span>{{ formatCurrency(row.end) }}</span>
            <strong :class="row.delta <= 0 ? 'delta--good' : 'delta--bad'">
              {{ row.delta > 0 ? '+' : '' }}{{ formatCurrency(row.delta) }}
            </strong>
          </div>
          <div class="conf-table__group-label">Factoring</div>
          <div v-for="row in reportComparison.factorRows" :key="'factor-' + row.key" class="conf-table__row"
            :class="{ 'conf-table__row--alert': row.alerta }">
            <span>{{ cleanCategoryLabel(row.key) }} <em v-if="row.critico" class="conf-table__tag">crítico</em></span>
            <span>Factor</span>
            <span>{{ formatCurrency(row.start) }}</span>
            <span>{{ formatCurrency(row.end) }}</span>
            <strong :class="row.delta <= 0 ? 'delta--good' : 'delta--bad'">
              {{ row.delta > 0 ? '+' : '' }}{{ formatCurrency(row.delta) }}
            </strong>
          </div>
        </div>

        <div v-if="conferencia" class="pdf-render-area" aria-hidden="true">
          <div id="conference-pdf-export" class="conference-pdf-document">

            <!-- Página 1: resumo -->
            <section class="conference-pdf conference-pdf-page">
              <header class="conference-pdf__header">
                <div class="conference-pdf__title">
                  <p class="conference-pdf__eyebrow">Controle de recebíveis</p>
                  <h1>Conferência Geral</h1>
                  <p>{{ conferencia.weekLabel }}</p>
                </div>

                <div class="conference-pdf__meta">
                  <div>
                    <span>Período</span>
                    <strong>{{ conferencia.weekLabel }}</strong>
                  </div>

                  <div>
                    <span>Carteiras</span>
                    <strong>{{ ALL_WALLETS.length }}</strong>
                  </div>

                  <div>
                    <span>Emitido por</span>
                    <strong>{{ conferencia.emittedBy }}</strong>
                  </div>
                </div>
              </header>

              <div class="conference-pdf__rule"></div>

              <section class="conference-pdf__metrics">
                <article>
                  <span>Comparações realizadas</span>
                  <strong>{{ conferenceSummary.totalRows }}</strong>
                  <small>Categorias FIDC e Factoring</small>
                </article>

                <article class="conference-pdf__metric--good">
                  <span>Valores conferindo</span>
                  <strong>{{ conferenceSummary.matchingRows }}</strong>
                  <small>Sem diferença para o valor geral</small>
                </article>

                <article :class="conferenceSummary.differentRows ? 'conference-pdf__metric--bad' : 'conference-pdf__metric--good'">
                  <span>Diferenças encontradas</span>
                  <strong>{{ conferenceSummary.differentRows }}</strong>
                  <small>Categorias que precisam de revisão</small>
                </article>

                <article :class="conferenceSummary.missingWallets.length ? 'conference-pdf__metric--warning' : 'conference-pdf__metric--good'">
                  <span>Carteiras pendentes</span>
                  <strong>{{ conferenceSummary.missingWallets.length }}</strong>
                  <small>
                    {{ conferenceSummary.missingWallets.length
                      ? conferenceSummary.missingWallets.join(', ')
                      : 'Todas as carteiras lançaram' }}
                  </small>
                </article>
              </section>

              <div
                class="conference-pdf__banner"
                :class="conferenceSummary.differentRows || conferenceSummary.missingWallets.length
                  ? 'conference-pdf__banner--warning'
                  : 'conference-pdf__banner--good'"
              >
                <span class="conference-pdf__banner-icon">
                  {{ conferenceSummary.differentRows || conferenceSummary.missingWallets.length ? '!' : '✓' }}
                </span>

                <p v-if="conferenceSummary.differentRows || conferenceSummary.missingWallets.length">
                  A conferência encontrou
                  <strong>{{ conferenceSummary.differentRows }} diferença(s)</strong>
                  e
                  <strong>{{ conferenceSummary.missingWallets.length }} carteira(s) pendente(s)</strong>.
                  Revise os lançamentos destacados.
                </p>

                <p v-else>
                  Todos os valores das carteiras conferem com o lançamento geral.
                  <strong>Nenhuma divergência foi encontrada.</strong>
                </p>
              </div>

              <section class="conference-pdf__summary-list">
                <article
                  v-for="bloco in conferencia.blocos"
                  :key="`summary-${bloco.tipo}`"
                  v-show="bloco.geralRecord"
                  class="conference-pdf__summary-card"
                >
                  <div>
                    <p class="conference-pdf__eyebrow">
                      {{ bloco.tipo === 'inicio' ? 'Abertura semanal' : 'Fechamento semanal' }}
                    </p>

                    <h2>
                      {{ bloco.tipo === 'inicio' ? 'Início da semana' : 'Fim da semana' }}
                    </h2>
                  </div>

                  <div class="conference-pdf__summary-numbers">
                    <span>
                      <small>Conferindo</small>
                      <strong>{{ conferenceBlockSummary(bloco).matchingRows }}</strong>
                    </span>

                    <span :class="{ 'summary-number--bad': conferenceBlockSummary(bloco).differentRows }">
                      <small>Diferenças</small>
                      <strong>{{ conferenceBlockSummary(bloco).differentRows }}</strong>
                    </span>

                    <span :class="{ 'summary-number--warning': bloco.walletsFaltando.length }">
                      <small>Pendentes</small>
                      <strong>{{ bloco.walletsFaltando.length }}</strong>
                    </span>
                  </div>
                </article>
              </section>

              <footer class="conference-pdf__footer conference-pdf__footer--bottom">
                <span>SafetyHub · Controle de recebíveis</span>
                <span>Resumo da conferência</span>
              </footer>
            </section>

            <!-- Uma página completa para cada etapa -->
            <section
              v-for="bloco in conferencia.blocos"
              :key="`pdf-page-${bloco.tipo}`"
              v-show="bloco.geralRecord"
              class="conference-pdf conference-pdf-page conference-pdf-page--detail"
            >
              <header class="conference-pdf__detail-header">
                <div>
                  <p class="conference-pdf__eyebrow">Conferência geral · {{ conferencia.weekLabel }}</p>
                  <h1>
                    {{ bloco.tipo === 'inicio' ? 'Início da semana' : 'Fim da semana' }}
                  </h1>
                </div>

                <div
                  class="conference-pdf__block-status"
                  :class="conferenceBlockSummary(bloco).differentRows
                    ? 'conference-pdf__block-status--bad'
                    : 'conference-pdf__block-status--good'"
                >
                  <span>Status</span>
                  <strong>
                    {{ conferenceBlockSummary(bloco).differentRows
                      ? `${conferenceBlockSummary(bloco).differentRows} diferença(s)`
                      : 'Valores conferem' }}
                  </strong>
                </div>
              </header>

              <div class="conference-pdf__rule conference-pdf__rule--compact"></div>

              <div
                v-if="bloco.walletsFaltando.length"
                class="conference-pdf__missing"
              >
                <strong>Carteiras sem lançamento:</strong>
                {{ bloco.walletsFaltando.join(', ') }}
              </div>

              <div class="conference-pdf__group conference-pdf__group--detail">
                <div class="conference-pdf__group-title">
                  <span>FIDC</span>
                  <small>Fundo de investimento</small>
                </div>

                <table class="conference-pdf__table conference-pdf__table--compact">
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Soma das carteiras</th>
                      <th>Valor geral</th>
                      <th>Diferença</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="row in bloco.fidcRows"
                      :key="`pdf-fidc-${bloco.tipo}-${row.key}`"
                      :class="{ 'conference-pdf__row--bad': row.diff !== 0 }"
                    >
                      <td>{{ cleanConferenceCategory(row.key) }}</td>
                      <td>{{ formatCurrency(row.soma) }}</td>
                      <td>{{ formatCurrency(row.geral) }}</td>
                      <td :class="row.diff === 0 ? 'value--good' : 'value--bad'">
                        {{ row.diff === 0 ? formatCurrency(0) : `${row.diff > 0 ? '+' : ''}${formatCurrency(row.diff)}` }}
                      </td>
                      <td>
                        <span
                          class="conference-pdf__status-pill"
                          :class="row.diff === 0
                            ? 'conference-pdf__status-pill--good'
                            : 'conference-pdf__status-pill--bad'"
                        >
                          {{ row.diff === 0 ? 'Confere' : 'Divergente' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="conference-pdf__group conference-pdf__group--detail">
                <div class="conference-pdf__group-title">
                  <span>Factoring</span>
                  <small>Operações de factoring</small>
                </div>

                <table class="conference-pdf__table conference-pdf__table--compact">
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Soma das carteiras</th>
                      <th>Valor geral</th>
                      <th>Diferença</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="row in bloco.factorRows"
                      :key="`pdf-factor-${bloco.tipo}-${row.key}`"
                      :class="{ 'conference-pdf__row--bad': row.diff !== 0 }"
                    >
                      <td>{{ cleanConferenceCategory(row.key) }}</td>
                      <td>{{ formatCurrency(row.soma) }}</td>
                      <td>{{ formatCurrency(row.geral) }}</td>
                      <td :class="row.diff === 0 ? 'value--good' : 'value--bad'">
                        {{ row.diff === 0 ? formatCurrency(0) : `${row.diff > 0 ? '+' : ''}${formatCurrency(row.diff)}` }}
                      </td>
                      <td>
                        <span
                          class="conference-pdf__status-pill"
                          :class="row.diff === 0
                            ? 'conference-pdf__status-pill--good'
                            : 'conference-pdf__status-pill--bad'"
                        >
                          {{ row.diff === 0 ? 'Confere' : 'Divergente' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer class="conference-pdf__footer conference-pdf__footer--bottom">
                <span>SafetyHub · Controle de recebíveis</span>
                <span>Emitido em {{ conferencia.emittedAt }}</span>
              </footer>
            </section>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useSupabase } from '../composables/useSupabase' // agora cuida de login E dados, mesmo projeto
import { useNotifications } from '../composables/useNotifications'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import autoTable from 'jspdf-autotable'
import PdfReport from '../components/PdfReport.vue'
import { buildPdfReport } from '../utils/pdf/reportBuilder'

const { session, supabase } = useSupabase()
const { enviarNotificacao } = useNotifications()

/* ---------- Quem está logado + permissão ---------- */
const currentUser = ref(null) // { email, name, role, is_supervisor }
const accessChecked = ref(false)
const accessDenied = ref(false)
const myWallets = ref([]) // carteiras atribuídas ao usuário logado (vazio para supervisores, que veem todas)

const roleLabels = { confirmacao: 'Confirmação', gerencia: 'Gerência' }
const roleLabel = computed(() => (currentUser.value ? roleLabels[currentUser.value.role] : ''))
const isSupervisor = computed(() => !!currentUser.value?.is_supervisor)

async function resolveCurrentUser(email) {
  accessChecked.value = false
  accessDenied.value = false
  currentUser.value = null
  myWallets.value = []

  if (!email) { accessChecked.value = true; return }

  try {
    const { data, error } = await supabase
      .from('team_access')
      .select('email, name, role, is_supervisor')
      .eq('email', email)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      accessDenied.value = true
    } else {
      currentUser.value = data
      if (!data.is_supervisor) await fetchMyWallets(email)
    }
  } catch (e) {
    console.error(e)
    accessDenied.value = true
  } finally {
    accessChecked.value = true
  }
}

async function fetchMyWallets(email) {
  try {
    const { data, error } = await supabase
      .from('analyst_wallets')
      .select('wallet')
      .eq('email', email)

    if (error) throw error
    myWallets.value = data.map(r => r.wallet)
  } catch (e) {
    console.error(e)
    myWallets.value = []
  }
}

watch(() => session.value?.user?.email, (email) => resolveCurrentUser(email), { immediate: true })

/* ---------- Ledgers ---------- */
const fidc = reactive({
  'Falta Canhoto - FIDC - 10 Dias - Geral': '',
  'Falta Canhoto Canhoto Recebido - FIDC - 10 Dias - Geral': '',
  'Falta Canhoto - FIDC - 30 Dias - Geral': '',
  'Falta Canhoto Canhoto Recebido - FIDC - 30 Dias - Geral': '',
  'Falta Canhoto - FIDC - 31+ Dias - Geral': '',
  'Falta Canhoto Canhoto Recebido - FIDC - 31+ Dias - Geral': '',
  'Minuta - FIDC - Geral': ''
})

const factor = reactive({
  'Falta Canhoto - Factor - 10 Dias - Geral': '',
  'Falta Canhoto Canhoto Recebido - Factor - 10 Dias - Geral': '',
  'Falta Canhoto - Factor - 30 Dias - Geral': '',
  'Falta Canhoto Canhoto Recebido - Factor - 30 Dias - Geral': '',
  'Falta Canhoto - Factor - 31+ Dias - Geral': '',
  'Falta Canhoto Canhoto Recebido - Factor - 31+ Dias - Geral': '',
  'Minuta - Factor - Geral': ''
})

function parseInputValue(value) {
  return Number(String(value).replace(',', '.')) || 0
}

function sumObject(obj) {
  if (!obj) return 0
  return Object.values(obj).reduce((s, v) => s + parseInputValue(v), 0)
}

const fidcTotal = computed(() => sumObject(fidc))
const factorTotal = computed(() => sumObject(factor))

function clearInputs() {
  Object.keys(fidc).forEach(key => { fidc[key] = '' })
  Object.keys(factor).forEach(key => { factor[key] = '' })
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.split('-').reverse().join('/')
}

function cleanCategoryLabel(key) {
  return String(key || '')
    .split(' - ')
    .filter(part => !/^(FIDC|Factor|Geral)$/i.test(part.trim()))
    .join(' - ')
}

/* ---------- Week math ---------- */
function getWeekStart(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const day = date.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + diff)
  return date.toISOString().slice(0, 10)
}

function formatWeekLabel(weekStart) {
  const start = new Date(`${weekStart}T00:00:00Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 4)
  const fmt = dt => dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
  return `Semana de ${fmt(start)} a ${fmt(end)}`
}

/* ---------- Wallet + entry state ---------- */
const ALL_WALLETS = ['Letícia', 'Herculano', 'Thiago', 'Thamires', 'Daiane', 'Douglas']
const GERAL_WALLET = 'Geral (conferência)'

const realWalletOptions = computed(() => (isSupervisor.value ? ALL_WALLETS : myWallets.value))

const selectedWallet = ref('')

watch([currentUser, myWallets], () => {
  if (!currentUser.value) { selectedWallet.value = ''; return }
  if (selectedWallet.value && (realWalletOptions.value.includes(selectedWallet.value) || selectedWallet.value === GERAL_WALLET)) return
  selectedWallet.value = realWalletOptions.value[0] || (isSupervisor.value ? GERAL_WALLET : '')
})

const entryDate = ref(new Date().toISOString().slice(0, 10))
const currentWeekStart = computed(() => getWeekStart(entryDate.value))
const weekLabel = computed(() => formatWeekLabel(currentWeekStart.value))

const saving = ref(false)
const saveError = ref('')
const weekStatus = ref({ inicio: null, fim: null })

/* ---------- Comparison report state (declared early: referenced by the watcher below) ---------- */
const showReport = ref(false)
const reportComparison = ref(null)
const pdfReportData = ref(null)
const canEmitReport = computed(() => !!(weekStatus.value.inicio && weekStatus.value.fim))

async function fetchWeekStatus() {
  saveError.value = ''
  try {
    const { data, error } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .eq('week_start', currentWeekStart.value)
      .eq('wallet', selectedWallet.value)

    if (error) throw error

    weekStatus.value = {
      inicio: data.find(r => r.snapshot_type === 'inicio') || null,
      fim: data.find(r => r.snapshot_type === 'fim') || null
    }
  } catch (e) {
    console.error(e)
    saveError.value = 'Não foi possível consultar o banco de dados.'
  }
}

watch([currentWeekStart, selectedWallet], () => { fetchWeekStatus(); showReport.value = false }, { immediate: true })
watch(selectedWallet, () => fetchAvailableWeeks())

const nextSnapshotType = computed(() => (!weekStatus.value.inicio ? 'inicio' : 'fim'))
const nextSnapshotLabel = computed(() => (nextSnapshotType.value === 'inicio' ? 'início da semana' : 'fim da semana'))

async function saveManualInputs() {
  if (!currentUser.value) return
  saving.value = true
  saveError.value = ''

  const parsedFidc = {}
  const parsedFactor = {}
  Object.entries(fidc).forEach(([key, value]) => { parsedFidc[key] = parseInputValue(value) })
  Object.entries(factor).forEach(([key, value]) => { parsedFactor[key] = parseInputValue(value) })

  const payload = {
    week_start: currentWeekStart.value,
    wallet: selectedWallet.value,
    snapshot_type: nextSnapshotType.value,
    analyst_email: currentUser.value.email,
    analyst_name: currentUser.value.name,
    captured_at: entryDate.value,
    fidc: parsedFidc,
    factor: parsedFactor
  }

  try {
    const { error } = await supabase
      .from('weekly_snapshots')
      .upsert(payload, { onConflict: 'week_start,wallet,snapshot_type' })

    if (error) throw error

    const tipoLabel = payload.snapshot_type === 'inicio' ? 'início' : 'fim'
    await enviarNotificacao({
      type: 'lancamento',
      message: `${currentUser.value.name} lançou o ${tipoLabel} da semana — carteira ${selectedWallet.value}`,
      created_by: currentUser.value.name
    })

    await fetchWeekStatus()
    await fetchAvailableWeeks()
    clearInputs()
  } catch (e) {
    console.error(e)
    saveError.value = 'Não foi possível salvar no banco. Tente novamente.'
  } finally {
    saving.value = false
  }
}

function editManualInputs() {
  const record = weekStatus.value.fim || weekStatus.value.inicio
  if (!record) return
  Object.keys(fidc).forEach(k => { fidc[k] = record.fidc?.[k] ?? '' })
  Object.keys(factor).forEach(k => { factor[k] = record.factor?.[k] ?? '' })
}

/* ---------- Weeks browser (per wallet) ---------- */
const weeksOpen = ref(false)
const weeksDropdownRef = ref(null)
const availableWeeks = ref([])

async function fetchAvailableWeeks() {
  try {
    const { data, error } = await supabase
      .from('weekly_snapshots')
      .select('week_start, snapshot_type')
      .eq('wallet', selectedWallet.value)
      .order('week_start', { ascending: false })

    if (error) throw error

    const byWeek = new Map()
    data.forEach(r => {
      if (!byWeek.has(r.week_start)) byWeek.set(r.week_start, new Set())
      byWeek.get(r.week_start).add(r.snapshot_type)
    })

    availableWeeks.value = Array.from(byWeek.entries()).map(([weekStart, types]) => ({
      weekStart,
      label: formatWeekLabel(weekStart),
      hasBoth: types.has('inicio') && types.has('fim')
    }))
  } catch (e) {
    console.error(e)
  }
}

function selectWeek(weekStart) {
  entryDate.value = weekStart
  weeksOpen.value = false
}

function handleClickOutsideWeeks(event) {
  if (weeksDropdownRef.value && !weeksDropdownRef.value.contains(event.target)) {
    weeksOpen.value = false
  }
}

/* ---------- Equipe (acesso ao perfil de qualquer um) ---------- */
const equipeOpen = ref(false)
const equipeDropdownRef = ref(null)
const teamRoster = ref([])

async function fetchTeamRoster() {
  try {
    const { data, error } = await supabase
      .from('team_access')
      .select('email, name')
      .order('name')

    if (error) throw error
    teamRoster.value = data
  } catch (e) {
    console.error(e)
  }
}

function handleClickOutsideEquipe(event) {
  if (equipeDropdownRef.value && !equipeDropdownRef.value.contains(event.target)) {
    equipeOpen.value = false
  }
}

onMounted(() => {
  fetchAvailableWeeks()
  fetchTeamRoster()
  document.addEventListener('click', handleClickOutsideWeeks)
  document.addEventListener('click', handleClickOutsideEquipe)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideWeeks)
  document.removeEventListener('click', handleClickOutsideEquipe)
})

/* ---------- Comparison report ---------- */

// "10 dias" é recente — normal ainda subir até o fim da semana (fornecedor pode não ter entregado).
// "30 dias", "31+ dias" e "Minuta" são críticos — a expectativa é cair até sexta; se subiu, é sinal de alerta.
function isCriticalCategory(key) {
  return /30 Dias|31\+ Dias|Minuta/i.test(key)
}

function buildRows(inicioObj, fimObj) {
  const keys = new Set([...Object.keys(inicioObj || {}), ...Object.keys(fimObj || {})])
  return Array.from(keys).map(key => {
    const start = Number(inicioObj?.[key] || 0)
    const end = Number(fimObj?.[key] || 0)
    const delta = end - start
    const critico = isCriticalCategory(key)
    return { key, start, end, delta, critico, alerta: critico && delta > 0 }
  })
}

function generateReport() {
  if (!canEmitReport.value || !currentUser.value) return

  const inicio = weekStatus.value.inicio
  const fim = weekStatus.value.fim

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

  const alertas = allRows.filter(row => row.alerta)

  const startTotal =
    fidcRows.reduce((total, row) => total + row.start, 0) +
    factorRows.reduce((total, row) => total + row.start, 0)

  const endTotal =
    fidcRows.reduce((total, row) => total + row.end, 0) +
    factorRows.reduce((total, row) => total + row.end, 0)

  reportComparison.value = {
    weekLabel: formatWeekLabel(currentWeekStart.value),
    weekStart: currentWeekStart.value,
    wallet: selectedWallet.value,
    inicio,
    fim,
    fidcRows,
    factorRows,
    biggestDrop,
    biggestRise,
    alertas,
    startTotal,
    endTotal,
    totalDelta: endTotal - startTotal,
    emittedBy: currentUser.value.name,
    emittedAt: new Date().toLocaleString('pt-BR')
  }

  pdfReportData.value = buildPdfReport(
    reportComparison.value
  )

  showReport.value = true
}


/* ---------- Tabela estilo planilha (Factor / Fidc / Totais por data) ---------- */
const SPREADSHEET_COLUMNS = [
  { keyBase: 'Falta Canhoto', suffix: '10 Dias' },
  { keyBase: 'Falta Canhoto Canhoto Recebido', suffix: '10 Dias' },
  { keyBase: 'Falta Canhoto', suffix: '30 Dias' },
  { keyBase: 'Falta Canhoto Canhoto Recebido', suffix: '30 Dias' },
  { keyBase: 'Falta Canhoto', suffix: '31+ Dias' },
  { keyBase: 'Falta Canhoto Canhoto Recebido', suffix: '31+ Dias' },
  { keyBase: 'Minuta', suffix: null }
]

function categoryKey(portfolio, col) {
  return col.suffix
    ? `${col.keyBase} - ${portfolio} - ${col.suffix} - Geral`
    : `${col.keyBase} - ${portfolio} - Geral`
}

function buildPortfolioRow(record, portfolio) {
  const obj = portfolio === 'FIDC' ? record?.fidc : record?.factor
  const values = SPREADSHEET_COLUMNS.map(col => Number(obj?.[categoryKey(portfolio, col)] || 0))
  return { values, total: values.reduce((s, v) => s + v, 0) }
}

function buildDayBlock(record) {
  if (!record) return null
  const factor = buildPortfolioRow(record, 'Factor')
  const fidc = buildPortfolioRow(record, 'FIDC')
  const totals = SPREADSHEET_COLUMNS.map((_, i) => factor.values[i] + fidc.values[i])
  const totalDoDia = factor.total + fidc.total
  return { factor, fidc, totals, totalDoDia }
}

const spreadsheetBlock = computed(() => {
  if (!reportComparison.value) return null
  const inicio = buildDayBlock(reportComparison.value.inicio)
  const fim = buildDayBlock(reportComparison.value.fim)
  if (!inicio || !fim) return null
  return { inicio, fim, totalBaixado: inicio.totalDoDia - fim.totalDoDia }
})

/* ---------- PDF export ---------- */
async function baixarPdf() {
  if (!pdfReportData.value) {
    saveError.value =
      'Emita o relatório antes de baixar o PDF.'

    return
  }

  const element = document.getElementById(
    'pdf-report-export'
  )

  if (!element) {
    saveError.value =
      'Não foi possível localizar o relatório para exportação.'

    return
  }

  try {
    saveError.value = ''

    await document.fonts?.ready

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    })

    const imageData = canvas.toDataURL(
      'image/png',
      1
    )

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const margin = 8

    const availableWidth =
      pageWidth - margin * 2

    const availableHeight =
      pageHeight - margin * 2

    const imageWidth = availableWidth

    const imageHeight =
      canvas.height * imageWidth / canvas.width

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

      positionY =
        margin - (
          imageHeight - remainingHeight
        )

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

    const walletName = String(
      pdfReportData.value.wallet || 'carteira'
    )
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()

    const week =
      pdfReportData.value.weekStart ||
      new Date().toISOString().slice(0, 10)

    pdf.save(
      `relatorio-${walletName}-${week}.pdf`
    )
  } catch (error) {
    console.error(
      'Erro ao gerar PDF:',
      error
    )

    saveError.value =
      'Não foi possível gerar o PDF. Tente novamente.'
  }
}

/* ---------- Conferência geral (soma das carteiras × valor da Eliane) ---------- */
const conferencia = ref(null)

function buildConferenciaRows(somaObj, geralObj) {
  const keys = new Set([...Object.keys(somaObj || {}), ...Object.keys(geralObj || {})])
  return Array.from(keys).map(key => {
    const soma = Number(somaObj?.[key] || 0)
    const geral = Number(geralObj?.[key] || 0)
    return { key, soma, geral, diff: geral - soma, critico: isCriticalCategory(key) }
  })
}

async function gerarConferencia() {
  if (!currentUser.value || selectedWallet.value !== GERAL_WALLET) return

  try {
    const { data, error } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .eq('week_start', currentWeekStart.value)
      .neq('wallet', GERAL_WALLET)

    if (error) throw error

    const blocos = ['inicio', 'fim'].map(tipo => {
      const geralRecord = tipo === 'inicio' ? weekStatus.value.inicio : weekStatus.value.fim
      if (!geralRecord) return { tipo, geralRecord: null }

      const registros = data.filter(r => r.snapshot_type === tipo)
      const somaFidc = {}
      const somaFactor = {}
      registros.forEach(r => {
        Object.entries(r.fidc || {}).forEach(([k, v]) => { somaFidc[k] = (somaFidc[k] || 0) + Number(v || 0) })
        Object.entries(r.factor || {}).forEach(([k, v]) => { somaFactor[k] = (somaFactor[k] || 0) + Number(v || 0) })
      })

      const walletsPresentes = new Set(registros.map(r => r.wallet))
      const walletsFaltando = ALL_WALLETS.filter(w => !walletsPresentes.has(w))

      return {
        tipo,
        geralRecord,
        fidcRows: buildConferenciaRows(somaFidc, geralRecord.fidc),
        factorRows: buildConferenciaRows(somaFactor, geralRecord.factor),
        walletsFaltando
      }
    })

    conferencia.value = {
      weekLabel: formatWeekLabel(currentWeekStart.value),
      weekStart: currentWeekStart.value,
      blocos,
      emittedBy: currentUser.value.name,
      emittedAt: new Date().toLocaleString('pt-BR')
    }
  } catch (e) {
    console.error(e)
    saveError.value = 'Não foi possível gerar a conferência.'
  }
}

const generatingConferencePdf = ref(false)

function cleanConferenceCategory(key) {
  return String(key || '')
    .split(' - ')
    .filter(part => !/^(FIDC|Factor|Geral)$/i.test(part.trim()))
    .join(' - ')
}

function conferenceBlockSummary(bloco) {
  const rows = [
    ...(bloco?.fidcRows || []),
    ...(bloco?.factorRows || [])
  ]

  return {
    totalRows: rows.length,
    matchingRows: rows.filter(row => row.diff === 0).length,
    differentRows: rows.filter(row => row.diff !== 0).length
  }
}

const conferenceSummary = computed(() => {
  const blocks = conferencia.value?.blocos || []
  const validBlocks = blocks.filter(bloco => bloco.geralRecord)
  const rows = validBlocks.flatMap(bloco => [
    ...(bloco.fidcRows || []),
    ...(bloco.factorRows || [])
  ])

  const missingWallets = Array.from(
    new Set(
      validBlocks.flatMap(bloco => bloco.walletsFaltando || [])
    )
  )

  return {
    totalRows: rows.length,
    matchingRows: rows.filter(row => row.diff === 0).length,
    differentRows: rows.filter(row => row.diff !== 0).length,
    missingWallets
  }
})

async function baixarPdfConferencia() {
  const c = conferencia.value

  if (!c || generatingConferencePdf.value) return

  generatingConferencePdf.value = true
  saveError.value = ''

  try {
    await document.fonts?.ready
    await nextTick()

    const container = document.getElementById(
      'conference-pdf-export'
    )

    if (!container) {
      throw new Error(
        'Não foi possível localizar o relatório da conferência.'
      )
    }

    const pages = Array.from(
      container.querySelectorAll('.conference-pdf-page')
    ).filter(page => page.offsetParent !== null)

    if (!pages.length) {
      throw new Error(
        'Nenhuma página foi encontrada para exportação.'
      )
    }

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 6
    const availableWidth = pageWidth - margin * 2
    const availableHeight = pageHeight - margin * 2

    for (let index = 0; index < pages.length; index += 1) {
      const pageElement = pages[index]

      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: pageElement.scrollWidth,
        windowHeight: pageElement.scrollHeight
      })

      const imageData = canvas.toDataURL(
        'image/png',
        1
      )

      const widthRatio =
        availableWidth / canvas.width

      const heightRatio =
        availableHeight / canvas.height

      const ratio = Math.min(
        widthRatio,
        heightRatio
      )

      const renderedWidth =
        canvas.width * ratio

      const renderedHeight =
        canvas.height * ratio

      const positionX =
        (pageWidth - renderedWidth) / 2

      const positionY =
        (pageHeight - renderedHeight) / 2

      if (index > 0) {
        pdf.addPage()
      }

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
    }

    pdf.save(
      `conferencia-geral-${c.weekStart}.pdf`
    )
  } catch (error) {
    console.error(
      'Erro ao gerar o PDF da conferência:',
      error
    )

    saveError.value =
      error.message ||
      'Não foi possível gerar o PDF da conferência.'
  } finally {
    generatingConferencePdf.value = false
  }
}

watch([currentWeekStart, selectedWallet], () => { conferencia.value = null })
</script>

<style scoped>
/* ============================================================
   Design tokens
   ============================================================ */
.rastrear-page {
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
  padding: 2rem clamp(1rem, 3vw, 2.5rem);
  min-height: 100vh;
  box-sizing: border-box;
  display: grid;
  gap: 1.75rem;
  max-width: 1280px;
  margin: 0 auto;
}

.rastrear-page h1,
.rastrear-page h2,
.rastrear-page h3,
.rastrear-page h4 {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
}

.rastrear-page strong,
.rastrear-page input[type="number"],
.rastrear-page em {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-style: normal;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--jade);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* ===== Access gate ===== */
.access-gate {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
  padding: 3rem 1rem;
  text-align: left;
}

.access-gate h2 {
  font-size: 1.3rem;
}

/* ===== Header ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--line);
}

.page-header h1 {
  font-size: clamp(1.5rem, 2.4vw, 2rem);
}

.page-subtitle {
  margin: 0.6rem 0 0;
  max-width: 640px;
  color: var(--paper-dim);
  line-height: 1.55;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.user-badge {
  display: grid;
  justify-items: end;
  gap: 0.15rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  color: var(--paper);
  cursor: pointer;
  transition: background 0.12s ease;
}

.user-badge:hover {
  background: rgba(255, 255, 255, 0.09);
}

.user-badge small {
  color: var(--paper-dim);
  font-weight: 500;
  font-size: 0.74rem;
}

.user-badge--gerencia {
  border-color: rgba(127, 182, 227, 0.4);
}

/* ===== Week bar ===== */
.week-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  padding: 1.1rem 1.3rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
}

.week-bar__status {
  display: grid;
  gap: 0.4rem;
}

.week-bar__label {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
}

.status-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-pill {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-pill--done {
  background: var(--jade-dim);
  color: var(--jade);
}

.status-pill--pending {
  background: rgba(255, 255, 255, 0.06);
  color: var(--paper-dim);
}

.week-bar__weeks {
  margin-left: auto;
}

/* ===== Buttons ===== */
.btn {
  border: none;
  border-radius: 0.7rem;
  padding: 0.75rem 1.15rem;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.12s ease, filter 0.12s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn:active {
  transform: translateY(1px);
}

.btn--primary {
  background: linear-gradient(135deg, #7bf0a6, #2fa85e);
  color: #05170c;
}

.btn--accent {
  background: linear-gradient(135deg, #9fd7f5, #4f8fc4);
  color: #04141f;
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.06);
  color: var(--paper);
  border: 1px solid var(--line);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn--primary:hover,
.btn--accent:hover {
  filter: brightness(1.06);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ===== Fields ===== */
.field {
  display: grid;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--paper-dim);
}

.field--sm input,
.field--sm select {
  width: 10rem;
}

.field input,
.field__select {
  padding: 0.55rem 0.7rem;
  border-radius: 0.55rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--paper);
  font-family: inherit;
  color-scheme: dark;
}

.field__select option,
.field__select optgroup {
  background: var(--panel-raised);
  color: var(--paper);
}

.field input:focus,
.field__select:focus {
  outline: 2px solid var(--jade);
  outline-offset: 1px;
}

/* ===== Dropdown ===== */
.dropdown {
  position: relative;
}

.dropdown__trigger {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.6rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--paper);
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.dropdown__trigger:hover {
  background: rgba(255, 255, 255, 0.07);
}

.dropdown__chevron {
  color: var(--paper-dim);
  transition: transform 0.15s ease;
}

.dropdown__chevron--open {
  transform: rotate(180deg);
}

.dropdown__panel {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  min-width: 240px;
  z-index: 20;
  display: grid;
  gap: 0.15rem;
  padding: 0.5rem;
  border-radius: 0.7rem;
  background: var(--panel-raised);
  border: 1px solid var(--line);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  max-height: 260px;
  overflow-y: auto;
}

.dropdown__option--button {
  width: 100%;
  border: none;
  background: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  color: var(--paper);
  cursor: pointer;
  text-align: left;
  text-decoration: none;
}

.dropdown__option--button:hover {
  background: rgba(255, 255, 255, 0.06);
}

.dropdown__option-tag {
  font-size: 0.68rem;
  color: var(--jade);
  border: 1px solid var(--jade-dim);
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
}

.dropdown__empty {
  padding: 0.6rem;
  margin: 0;
  color: var(--paper-dim);
  font-size: 0.82rem;
}

/* ===== Tags / chips ===== */
.tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.tag--fidc {
  background: var(--jade-dim);
  color: var(--jade);
}

.tag--factor {
  background: var(--brass-dim);
  color: var(--brass);
}

.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 0.7rem;
  font-size: 0.85rem;
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

/* ===== Ledger cards ===== */
.ledger-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--gap);
}

.ledger-card {
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
  border-left: 3px solid transparent;
  padding: 1.3rem;
}

.ledger-card--fidc {
  border-left-color: var(--jade);
}

.ledger-card--factor {
  border-left-color: var(--brass);
}

.ledger-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--line);
}

.ledger-card__title h2 {
  font-size: 1.05rem;
}

.ledger-total {
  font-size: 1.15rem;
}

.ledger-fields {
  display: grid;
  gap: 0.6rem;
}

.ledger-field {
  display: grid;
  grid-template-columns: 1fr 9.5rem;
  align-items: center;
  gap: 0.9rem;
  padding: 0.15rem 0;
}

.ledger-field span {
  font-size: 0.86rem;
  color: var(--paper-dim);
  line-height: 1.3;
}

.ledger-field input {
  width: 100%;
  text-align: right;
  padding: 0.55rem 0.7rem;
  border-radius: 0.55rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--paper);
}

.ledger-field input:focus {
  outline: 2px solid var(--jade);
  outline-offset: 1px;
}

.info-message {
  margin: 0;
  padding: 0.95rem 1.1rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--paper-dim);
  line-height: 1.5;
  border-left: 3px solid var(--steel);
}

/* ===== Actions ===== */
.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.error-banner {
  margin: 0;
  padding: 0.9rem 1.1rem;
  border-radius: 0.7rem;
  background: rgba(255, 148, 148, 0.1);
  border: 1px solid rgba(255, 148, 148, 0.35);
  color: var(--bad);
}

/* ===== Report ===== */
.report-view {
  display: grid;
  gap: 1.1rem;

  padding: 1.35rem;

  border: 1px solid rgba(111, 227, 160, 0.2);
  border-radius: 1.05rem;

  background: #08150e;

  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.report-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.1rem 1.3rem;
  border-radius: var(--radius);
  background: #102219;
  border: 1px solid #263b30;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}

.report-summary__date {
  margin: 0.2rem 0 0;
  color: var(--paper-dim);
}

.report-summary__metrics {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* ===== Destaque + tabela estilo planilha ===== */
.sheet-banner {
  padding: 1.1rem 1.3rem;
  border-radius: var(--radius);
  background: #123b22;
  border: 1px solid #2f7d4d;
  color: var(--paper);
  font-size: 1rem;
  line-height: 1.6;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
}

.sheet-banner strong {
  color: var(--paper);
}

.sheet-banner__value {
  color: var(--jade);
  font-size: 1.15rem;
}

.sheet-table-wrap {
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid #314337;
  background: #09160f;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
}

.sheet-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  white-space: nowrap;
}

.sheet-table th,
.sheet-table td {
  border: 1px solid #26382d;
  padding: 0.58rem 0.72rem;
  text-align: center;
  background: #0a180f;
}

.sheet-table thead th {
  background: #292a15;
  color: #f2bd58;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.sheet-table__date {
  font-weight: 700;
  background: #11251a !important;
}

.sheet-table__row-label {
  text-align: left;
  color: #d7e3da;
  font-weight: 700;
  background: #0d1e14 !important;
}

.sheet-table__totais td {
  background: #272619;
  font-weight: 700;
}

.sheet-table__total-dia {
  background: #4a3227 !important;
  font-weight: 700;
}

.sheet-table__divider td {
  background: #0d2430;
  color: #7fc5ef;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}

.sheet-table__baixado td {
  background: #123b22;
  color: #78efa8;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: right;
}

.sheet-table__baixado td:first-child {
  text-align: left;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--gap);
}

.highlight-card {
  padding: 1.1rem 1.2rem;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.highlight-card span {
  color: var(--paper-dim);
  font-size: 0.8rem;
}

.highlight-card strong {
  font-size: 1.05rem;
  font-family: 'Space Grotesk', sans-serif;
}

.highlight-card small {
  color: var(--paper-dim);
}

.highlight-card--good {
  background: #123b22;
  border-color: #2f7d4d;
}

.highlight-card--good strong {
  color: var(--good);
}

.highlight-card--bad {
  background: #2d211b;
  border-color: #7d4c3d;
}

.highlight-card--bad strong {
  color: var(--bad);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--gap);
}

.dashboard-card {
  padding: 1.1rem 1.2rem;
  border-radius: var(--radius);
  background: var(--panel);
  border: 1px solid var(--line);
  border-left: 3px solid transparent;
}

.dashboard-card--fidc {
  border-left-color: var(--jade);
}

.dashboard-card--factor {
  border-left-color: var(--brass);
}

.dashboard-card h4 {
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
  color: var(--paper-dim);
}

.dashboard-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.7rem;
}

.dashboard-card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.86rem;
  flex-wrap: wrap;
}

.dashboard-card li>span {
  color: var(--paper-dim);
}

.conferencia-bloco {
  display: grid;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.conferencia-bloco__title {
  font-size: 1rem;
}

/* ===== Tabela de comparação (Item 1) ===== */
.conf-table {
  border-radius: var(--radius);
  background: #0d1e14;
  border: 1px solid #2a3c31;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
}

.conf-table__group-label {
  padding: 0.5rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paper-dim);
  background: rgba(255, 255, 255, 0.03);
}

.conf-table__row {
  display: grid;
  grid-template-columns: 2.2fr 0.8fr 1fr 1fr 1fr;
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

.conf-table__row:nth-of-type(even) {
  background: rgba(255, 255, 255, 0.015);
}

.conf-table__row--bad {
  background: rgba(255, 151, 151, 0.06);
}

.conf-table__row--alert {
  background: rgba(255, 151, 151, 0.12);
}

.conf-table__row span:not(.conf-table__tag) {
  color: var(--paper-dim);
}

.conf-table__row strong {
  text-align: right;
}

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

/* ===== Banner de alerta (Item 7) ===== */
.alert-banner {
  padding: 1rem 1.2rem;
  border-radius: var(--radius);
  background: #2b201b;
  border: 1px solid #784b3e;
  color: var(--paper);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}

.alert-banner strong {
  color: var(--bad);
  font-family: 'Inter', sans-serif;
}

.alert-banner ul {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
  color: var(--paper-dim);
  font-size: 0.85rem;
}

@media (max-width: 720px) {
  .conf-table__row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }

  .conf-table__row strong {
    text-align: left;
  }
}

.compare-values {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.82rem;
}

.compare-values em {
  color: var(--paper-dim);
}

.delta--good {
  color: var(--good);
}

.delta--bad {
  color: var(--bad);
}

/* ===== Responsive ===== */
@media (max-width: 980px) {

  .ledger-grid,
  .dashboard-grid,
  .highlight-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .rastrear-page {
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .user-badge {
    justify-items: start;
  }

  .week-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .week-bar__weeks {
    margin-left: 0;
  }

  .ledger-field {
    grid-template-columns: 1fr;
  }

  .ledger-field input {
    text-align: left;
  }

  .report-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .report-actions {
    flex-direction: column;
  }
}

.pdf-preview {
  width: 100%;
  overflow-x: auto;
  padding: 1rem;
  border-radius: 1rem;
  background: #dfe5e1;
}

/* ===== PDF da conferência geral ===== */
.conference-pdf {
  width: 1120px;
  box-sizing: border-box;
  padding: 42px 62px 34px;
  background: #ffffff;
  color: #122319;
  font-family: 'Inter', Arial, sans-serif;
}

.conference-pdf-document {
  display: grid;
  gap: 30px;
}

.conference-pdf-page {
  position: relative;
  min-height: 720px;
  overflow: hidden;
}

.conference-pdf-page--detail {
  padding-top: 38px;
  padding-bottom: 34px;
}

.conference-pdf__detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 30px;
}

.conference-pdf__detail-header h1 {
  margin: 0;
  color: #122319;
  font-family: 'Space Grotesk', Arial, sans-serif;
  font-size: 30px;
}

.conference-pdf__rule--compact {
  margin: 18px 0 14px;
}

.conference-pdf__summary-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

.conference-pdf__summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 22px;
  border: 1px solid #d9e3dc;
  border-radius: 14px;
  background: #f7faf8;
}

.conference-pdf__summary-card h2 {
  margin: 0;
  color: #17271d;
  font-family: 'Space Grotesk', Arial, sans-serif;
  font-size: 20px;
}

.conference-pdf__summary-numbers {
  display: flex;
  gap: 12px;
}

.conference-pdf__summary-numbers > span {
  min-width: 78px;
  padding: 10px;
  border-radius: 9px;
  background: #e9f6ee;
  text-align: center;
}

.conference-pdf__summary-numbers small {
  display: block;
  color: #607168;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
}

.conference-pdf__summary-numbers strong {
  display: block;
  margin-top: 5px;
  color: #217447;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 17px;
}

.conference-pdf__summary-numbers .summary-number--bad {
  background: #fdeaea;
}

.conference-pdf__summary-numbers .summary-number--bad strong {
  color: #b63232;
}

.conference-pdf__summary-numbers .summary-number--warning {
  background: #fff5dc;
}

.conference-pdf__summary-numbers .summary-number--warning strong {
  color: #9a6818;
}

.conference-pdf__group--detail {
  border: 1px solid #d9e3dc;
  border-radius: 10px;
  overflow: hidden;
}

.conference-pdf__group--detail + .conference-pdf__group--detail {
  margin-top: 14px;
}

.conference-pdf__table--compact th,
.conference-pdf__table--compact td {
  padding: 7px 9px;
}

.conference-pdf__footer--bottom {
  position: absolute;
  left: 62px;
  right: 62px;
  bottom: 22px;
}

.conference-pdf__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
}

.conference-pdf__title {
  max-width: 490px;
}

.conference-pdf__eyebrow {
  margin: 0 0 8px;
  color: #2ea967;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.19em;
  text-transform: uppercase;
}

.conference-pdf__title h1 {
  margin: 0;
  color: #122319;
  font-family: 'Space Grotesk', Arial, sans-serif;
  font-size: 35px;
  line-height: 1.05;
}

.conference-pdf__title > p:last-child {
  margin: 12px 0 0;
  color: #68736c;
  font-size: 16px;
}

.conference-pdf__meta {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 26px;
}

.conference-pdf__meta div {
  min-width: 105px;
}

.conference-pdf__meta span {
  display: block;
  color: #858c87;
  font-size: 11px;
}

.conference-pdf__meta strong {
  display: block;
  max-width: 175px;
  margin-top: 5px;
  color: #17271d;
  font-family: 'Space Grotesk', Arial, sans-serif;
  font-size: 14px;
}

.conference-pdf__rule {
  height: 2px;
  margin: 26px 0 24px;
  background: #62df96;
}

.conference-pdf__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.conference-pdf__metrics article {
  min-height: 102px;
  padding: 18px;
  border: 1px solid #dce5df;
  border-top: 4px solid #8fc3e8;
  border-radius: 12px;
  background: #f8faf8;
}

.conference-pdf__metrics .conference-pdf__metric--good {
  border-color: #a9dfbe;
  border-top-color: #46bc79;
  background: #f0fbf4;
}

.conference-pdf__metrics .conference-pdf__metric--bad {
  border-color: #f0b5b5;
  border-top-color: #e05454;
  background: #fff2f2;
}

.conference-pdf__metrics .conference-pdf__metric--warning {
  border-color: #efd39c;
  border-top-color: #e3aa40;
  background: #fff9ed;
}

.conference-pdf__metrics span {
  display: block;
  color: #5e6b63;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.conference-pdf__metrics strong {
  display: block;
  margin-top: 12px;
  color: #17271d;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 21px;
}

.conference-pdf__metrics small {
  display: block;
  margin-top: 9px;
  color: #849087;
  font-size: 9px;
  line-height: 1.35;
}

.conference-pdf__banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
  padding: 15px 22px;
  border-radius: 11px;
  color: #ffffff;
}

.conference-pdf__banner--good {
  background: #174d2f;
}

.conference-pdf__banner--warning {
  background: #77541f;
}

.conference-pdf__banner-icon {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  border-radius: 50%;
  background: #66e59b;
  color: #124326;
  font-size: 17px;
  font-weight: 900;
}

.conference-pdf__banner--warning .conference-pdf__banner-icon {
  background: #ffd987;
  color: #65440f;
}

.conference-pdf__banner p {
  margin: 0;
  font-size: 12px;
}

.conference-pdf__banner strong {
  color: #82efad;
}

.conference-pdf__banner--warning strong {
  color: #ffe0a2;
}

.conference-pdf__block {
  margin-top: 24px;
  overflow: hidden;
  border: 1px solid #d9e3dc;
  border-radius: 14px;
  background: #ffffff;
  break-inside: avoid;
}

.conference-pdf__block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding: 20px 22px;
  background: #f6f9f7;
}

.conference-pdf__block-head h2 {
  margin: 0;
  color: #17271d;
  font-family: 'Space Grotesk', Arial, sans-serif;
  font-size: 21px;
}

.conference-pdf__block-status {
  min-width: 185px;
  padding: 12px 16px;
  border: 1px solid #a9dfbe;
  border-radius: 10px;
  background: #effaf3;
  text-align: right;
}

.conference-pdf__block-status--bad {
  border-color: #efb4b4;
  background: #fff0f0;
}

.conference-pdf__block-status span {
  display: block;
  color: #28794a;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.conference-pdf__block-status--bad span {
  color: #b53434;
}

.conference-pdf__block-status strong {
  display: block;
  margin-top: 5px;
  color: #23804a;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
}

.conference-pdf__block-status--bad strong {
  color: #bd3030;
}

.conference-pdf__missing {
  padding: 11px 22px;
  border-top: 1px solid #ead39f;
  border-bottom: 1px solid #ead39f;
  background: #fff8e8;
  color: #785820;
  font-size: 10px;
}

.conference-pdf__group-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 13px 18px;
  border-top: 1px solid #dfe7e2;
  background: #edf5f0;
}

.conference-pdf__group:first-of-type .conference-pdf__group-title {
  border-top: none;
}

.conference-pdf__group-title span {
  color: #217245;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.conference-pdf__group-title small {
  color: #7d8981;
  font-size: 9px;
}

.conference-pdf__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.conference-pdf__table th,
.conference-pdf__table td {
  padding: 9px 11px;
  border-right: 1px solid #dfe7e2;
  border-bottom: 1px solid #dfe7e2;
  text-align: right;
}

.conference-pdf__table th:first-child,
.conference-pdf__table td:first-child {
  width: 38%;
  text-align: left;
}

.conference-pdf__table th:last-child,
.conference-pdf__table td:last-child {
  border-right: none;
}

.conference-pdf__table thead th {
  background: #dfece4;
  color: #31483a;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.conference-pdf__table tbody tr:nth-child(even) {
  background: #f8faf9;
}

.conference-pdf__row--bad {
  background: #fff0f0 !important;
}

.conference-pdf__table .value--good {
  color: #27804d;
  font-weight: 800;
}

.conference-pdf__table .value--bad {
  color: #bd3838;
  font-weight: 800;
}

.conference-pdf__status-pill {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 7px;
  font-weight: 800;
  text-transform: uppercase;
}

.conference-pdf__status-pill--good {
  background: #e4f5eb;
  color: #227447;
}

.conference-pdf__status-pill--bad {
  background: #fde7e7;
  color: #b33131;
}

.conference-pdf__footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid #d5dfd8;
  color: #7b867f;
  font-size: 9px;
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


/* ============================================================
   RESPONSIVIDADE — RASTREAR EPI
   ============================================================ */
.rastrear-page,
.page-header,
.week-bar,
.ledger-grid,
.ledger-card,
.ledger-fields,
.report-view,
.report-summary,
.report-summary__metrics,
.highlight-grid,
.conf-table,
.sheet-table-wrap {
  min-width: 0;
}

.sheet-table-wrap,
.conf-table {
  max-width: 100%;
}

.sheet-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.sheet-table {
  min-width: 980px;
}

@media (max-width: 1180px) {
  .rastrear-page {
    padding: 1.5rem clamp(1rem, 2.5vw, 1.5rem);
  }

  .week-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ledger-grid,
  .highlight-grid {
    grid-template-columns: 1fr;
  }

  .report-summary {
    align-items: flex-start;
  }

  .report-summary__metrics {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .rastrear-page {
    gap: 1.2rem;
    padding: 1.25rem 1rem 2rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-header__text,
  .header-actions {
    width: 100%;
  }

  .header-actions {
    justify-content: space-between;
  }

  .header-actions > * {
    min-width: 0;
  }

  .dropdown__panel {
    max-width: min(92vw, 340px);
  }

  .week-bar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .field,
  .field--sm,
  .week-bar__status,
  .week-bar__weeks,
  .week-bar__weeks .dropdown,
  .week-bar__weeks .dropdown__trigger {
    width: 100%;
  }

  .status-pills {
    align-items: stretch;
  }

  .status-pill {
    white-space: normal;
  }

  .ledger-card {
    padding: 1.1rem;
  }

  .ledger-card__head {
    align-items: flex-start;
  }

  .ledger-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .report-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .report-actions .btn {
    width: 100%;
  }

  .report-view {
    padding: 1rem;
  }

  .report-summary {
    flex-direction: column;
  }

  .report-summary__metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .chip {
    min-width: 0;
  }

  .conf-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .conf-table__row,
  .conf-table__group-label {
    min-width: 760px;
  }

  .crop-modal {
    width: min(92vw, 720px);
    max-height: 92vh;
    overflow-y: auto;
  }
}

@media (max-width: 640px) {
  .rastrear-page {
    padding: 1rem 0.75rem 1.5rem;
  }

  .page-header h1 {
    font-size: clamp(1.65rem, 8vw, 2.2rem);
  }

  .page-subtitle {
    font-size: 0.86rem;
  }

  .header-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .header-actions .dropdown,
  .header-actions .dropdown__trigger,
  .user-badge {
    width: 100%;
  }

  .ledger-fields {
    grid-template-columns: 1fr;
  }

  .ledger-card__head {
    flex-direction: column;
    gap: 0.75rem;
  }

  .ledger-total {
    width: 100%;
    text-align: left;
  }

  .report-actions {
    grid-template-columns: 1fr;
  }

  .report-summary__metrics {
    grid-template-columns: 1fr;
  }

  .sheet-banner,
  .alert-banner {
    padding: 0.9rem;
    font-size: 0.86rem;
  }

  .highlight-card {
    padding: 1rem;
  }

  .crop-modal-backdrop {
    padding: 0.75rem;
  }

  .crop-modal {
    width: 100%;
  }

  .crop-modal__header,
  .crop-modal__footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .crop-stage {
    min-height: 280px;
  }
}
</style>