<template>
  <section class="rastrear-page">
    <header class="rastrear-topbar">
      <div class="stats-grid">
        <div class="stat-card stat-card--green">
          <strong>{{ totalEpis }}</strong>
          <span>EPIs em uso</span>
        </div>
        <div class="stat-card stat-card--green">
          <strong>{{ devolucoes }}</strong>
          <span>devoluções</span>
        </div>
        <div class="stat-card stat-card--green">
          <strong>{{ totalResponsaveis }}</strong>
          <span>funcionários e alunos ativos</span>
        </div>
      </div>
    </header>

    <section class="fichas-panel">
      <h2>Fichas dos EPIs</h2>
      <div class="fichas-grid">
        <article class="ficha-card" v-for="f in fichas" :key="f.id">
          <div class="ficha-avatar">{{ initials(f.nomeResponsavel) }}</div>
          <h3>{{ f.nomeResponsavel }}</h3>
          <p class="ficha-role">Retirou: {{ f.nomeEpi }}</p>
          <p class="ficha-description">{{ f.categoria }} · {{ f.quantidade }} unidade(s)</p>
          <div class="ficha-data">
            <span>Data de Retirada</span>
            <strong>{{ formatDate(f.dataRetirada) }}</strong>
          </div>
          <div class="ficha-meta">
            <div>
              <span>ID do EPI</span>
              <strong>{{ f.id }}</strong>
            </div>
            <div>
              <span>Devoluções Realizadas</span>
              <strong>{{ f.devolucoes || 0 }}</strong>
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <input type="number" class="devolver-input" v-model.number="f._devolverCount" :min="1"
              :max="Math.max(1, (f.quantidade || 0) - (f.devolucoes || 0))" />
            <button class="ficha-button" @click="devolver(f)"
              :disabled="(f.quantidade || 0) - (f.devolucoes || 0) <= 0">Devolver EPI</button>
            <button class="ficha-button" @click="deleteFicha(f)"
              style="background:rgba(200,40,40,0.95)">Excluir</button>
            <button class="ficha-button">Gerar PDF</button>
          </div>
        </article>
      </div>
      <div v-if="fichas.length === 0" class="empty-state">Nenhuma ficha de EPI encontrada.</div>
    </section>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const STORAGE_KEY = 'epi-fichas'
const fichas = ref([])

function loadFichas() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    fichas.value = raw.map((f) => ({
      ...f,
      devolucoes: Number(f.devolucoes || 0),
      _devolverCount: Number(f._devolverCount || 1)
    }))
  } catch {
    fichas.value = []
  }
}

function saveFichas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fichas.value))
}

function initials(name) {
  return (name || '').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const totalEpis = computed(() => fichas.value.reduce((sum, item) => sum + Number(item.quantidade || 0), 0))
const totalResponsaveis = computed(() => new Set(fichas.value.map((item) => item.nomeResponsavel)).size)

const devolucoes = computed(() => fichas.value.reduce((sum, item) => sum + Number(item.devolucoes || 0), 0))

function devolver(ficha) {
  const requested = Number(ficha._devolverCount || 1) || 1
  const maxAvailable = Number(ficha.quantidade || 0) - Number(ficha.devolucoes || 0)
  if (maxAvailable <= 0) return
  const toAdd = Math.min(requested, maxAvailable)
  ficha.devolucoes = Number(ficha.devolucoes || 0) + toAdd
  // reset requested count to 1 for convenience
  ficha._devolverCount = 1
  saveFichas()
}

function deleteFicha(ficha) {
  if (!confirm('Excluir esta ficha de EPI? Esta operação não pode ser desfeita.')) return
  const idx = fichas.value.findIndex((x) => x.id === ficha.id)
  if (idx >= 0) {
    fichas.value.splice(idx, 1)
    saveFichas()
  }
}

onMounted(loadFichas)
</script>

<style scoped>
.rastrear-page {
  padding: 1.75rem;
  min-height: 100vh;
  color: #eef2ee;
}

.rastrear-topbar {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(17, 30, 24, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-card--green strong {
  color: #4aed6d;
  font-size: 2.75rem;
}

.stat-card span {
  color: rgba(255, 255, 255, 0.65);
}

.fichas-panel {
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: rgba(15, 20, 19, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.fichas-panel h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.fichas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;
}

.ficha-card {
  padding: 1.25rem;
  border-radius: 1rem;
  background: #0a1210;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ficha-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: rgba(74, 173, 106, 0.14);
  color: #d8f4d5;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1rem;
}

.ficha-card h3 {
  margin: 0;
  color: #f4f8f3;
}

.ficha-role,
.ficha-description,
.ficha-data span {
  color: rgba(255, 255, 255, 0.65);
}

.ficha-description {
  margin: 0;
}

.ficha-data {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ficha-data strong {
  color: #fff;
}

.ficha-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.ficha-meta span {
  display: block;
  font-size: 0.8rem;
}

.ficha-meta strong {
  color: #d2f0d3;
}

.ficha-button {
  border: none;
  border-radius: 0.85rem;
  padding: 0.85rem;
  color: #fff;
  background: rgba(52, 121, 64, 0.95);
  cursor: pointer;
}

.empty-state {
  color: rgba(255, 255, 255, 0.5);
  padding: 2rem 0;
  text-align: center;
}

@media (max-width: 900px) {

  .stats-grid,
  .fichas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
