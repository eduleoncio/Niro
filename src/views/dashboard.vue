<template>
  <div class="shell">
    <Sidebar v-model:collapsed="isSidebarCollapsed" />

    <main class="conteudo" :style="{ marginLeft: isSidebarCollapsed ? '80px' : '250px' }">
      <section class="dashboard-top" v-if="isDashboardRoot">

        <div class="stat-grid">
          <article class="stat-card stat-card--green">
            <span class="stat-label">EPIs cadastrados</span>
            <strong>{{ totalEPIs }}</strong>
            <small>Total de itens no sistema</small>
          </article>

          <article class="stat-card stat-card--orange">
            <span class="stat-label">EPIs retirados hoje</span>
            <strong>{{ retiradosHoje }}</strong>
            <small>Movimentação do dia</small>
          </article>

          <article class="stat-card stat-card--red">
            <span class="stat-label">EPIs sem estoque</span>
            <strong>{{ semEstoque }}</strong>
            <small>Produtos críticos</small>
          </article>

          <article class="stat-card stat-card--blue">
            <span class="stat-label">Maior quantidade</span>
            <strong>{{ maiorQuantidadeNome || '—' }}</strong>
            <small>EPI com mais unidades</small>
          </article>

          <article class="stat-card stat-card--purple">
            <span class="stat-label">EPIs mais caros</span>
            <strong>{{ expensiveChart.length ? expensiveChart[0].label : '—' }}</strong>
            <small>Maior valor unitário</small>
          </article>
        </div>

        <div class="charts-grid">
          <section class="chart-card">
            <div class="chart-card__header">
              <div>
                <h2>EPIs com mais quantidade</h2>
                <p>Relação dos itens em estoque ordenados por volume.</p>
              </div>
              <span class="chip">Top 5</span>
            </div>
            <div class="bar-chart">
              <div class="bar-row" v-for="item in quantityChart" :key="item.label">
                <div class="bar-info">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.width + '%' }"></div>
                </div>
              </div>
            </div>
          </section>

          <section class="chart-card chart-card--split">
            <div class="chart-card__header">
              <div>
                <h2>EPIs mais caros</h2>
                <p>O valor unitário dos itens de maior custo.</p>
              </div>
            </div>
            <div class="price-list">
              <div class="price-item" v-for="item in expensiveChart" :key="item.label">
                <div>
                  <span class="price-name">{{ item.label }}</span>
                  <p class="price-subtitle">R$ {{ item.price.toFixed(2) }}</p>
                </div>
                <strong>{{ item.margin }}%</strong>
              </div>
            </div>
          </section>
        </div>
      </section>

      <RouterView v-if="!isDashboardRoot" />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'
import Sidebar from '../components/sidebar.vue'

const isSidebarCollapsed = ref(true)
const route = useRoute()
const isDashboardRoot = computed(() => route.path === '/dashboard')

const { supabase } = useSupabase()

const totalEPIs = ref(0)
const retiradosHoje = ref(0) // no transactions table available; default 0
const semEstoque = ref(0)
const maiorQuantidadeNome = ref('')

const quantityChart = ref([])
const expensiveChart = ref([])

onMounted(async () => {
  try {
    const { data, error } = await supabase.from('epis').select('*')
    if (error) {
      console.error('Erro ao buscar EPIs:', error)
      return
    }

    const rows = data || []
    totalEPIs.value = rows.length

    // sem estoque: quantidade <= 0 or null
    semEstoque.value = rows.filter(r => !(r.quantidade) || Number(r.quantidade) <= 0).length

    // maior quantidade
    const byQuantity = rows.slice().sort((a, b) => (Number(b.quantidade) || 0) - (Number(a.quantidade) || 0))
    maiorQuantidadeNome.value = byQuantity.length ? (byQuantity[0].nome_epi || '') : ''

    // quantity chart - top 5
    const topQty = byQuantity.slice(0, 5).map(r => ({ label: r.nome_epi || '—', value: Number(r.quantidade) || 0 }))
    const maxVal = topQty.length ? Math.max(...topQty.map(i => i.value)) : 1
    quantityChart.value = topQty.map(i => ({ ...i, width: maxVal ? Math.round((i.value / maxVal) * 100) : 0 }))

    // expensive chart - top 4 by preco
    const byPrice = rows.slice().sort((a, b) => (Number(b.preco) || 0) - (Number(a.preco) || 0))
    const topExp = byPrice.slice(0, 4).map(r => ({ label: r.nome_epi || '—', price: Number(r.preco) || 0 }))
    // margin: relative percentage to highest
    const highest = topExp.length ? topExp[0].price : 1
    expensiveChart.value = topExp.map(e => ({ ...e, margin: highest ? Math.round((e.price / highest) * 100) : 0 }))

    // try to detect today's withdrawals from common tables
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isoStart = today.toISOString()
    const movementTables = ['movimentacoes', 'movimentacao', 'retiradas', 'entregas']
    for (const t of movementTables) {
      try {
        const resp = await supabase.from(t).select('id', { count: 'exact' }).gte('created_at', isoStart)
        if (!resp.error && resp.count != null) {
          retiradosHoje.value = resp.count
          break
        }
      } catch (e) {
        // table or column may not exist — ignore and try next
      }
    }

    // also check localStorage fallback used by RetirarEPI view
    try {
      const local = localStorage.getItem('epi-fichas')
      if (local) {
        const fichas = JSON.parse(local)
        const localCount = (fichas || []).filter(f => {
          if (!f.createdAt) return false
          try {
            const d = new Date(f.createdAt)
            return d >= new Date(isoStart)
          } catch { return false }
        }).length
        retiradosHoje.value = (retiradosHoje.value || 0) + localCount
      }
    } catch (e) {
      // ignore localStorage errors
    }

  } catch (err) {
    console.error('Erro ao carregar dashboard:', err)
  }
})
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
  margin-left: 250px;
  padding: 30px;
  color: #f4f7f1;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}


.dashboard-header h1 {
  margin: 0;
  font-size: clamp(2rem, 2.5vw, 3rem);
}

.status-pill {
  background: rgba(32, 73, 25, 0.75);
  border: 1px solid rgba(126, 213, 111, 0.25);
  border-radius: 999px;
  color: #c7f7b8;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(13, 40, 17, 0.9);
  border: 1px solid rgba(126, 213, 111, 0.16);
  border-radius: 18px;
  padding: 1.5rem;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(126, 213, 111, 0.45);
}

.stat-label {
  color: #ffffff;
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
}

.stat-card strong {
  font-size: 1.2rem;
  margin: 0.75rem 0 0.5rem;
  display: block;
}

.stat-card small {
  color: #a7bf9f;
}

.stat-card--green {
  background: linear-gradient(180deg, rgba(21, 72, 24, 0.95) 0%, rgba(8, 24, 11, 0.9) 100%);
}

.stat-card--orange {
  background: linear-gradient(180deg, rgba(90, 47, 16, 0.92) 0%, rgba(16, 35, 13, 0.9) 100%);
}

.stat-card--red {
  background: linear-gradient(180deg, rgba(76, 17, 17, 0.92) 0%, rgba(12, 22, 12, 0.9) 100%);
}

.stat-card--blue {
  background: linear-gradient(180deg, rgba(11, 32, 55, 0.92) 0%, rgba(9, 19, 15, 0.9) 100%);
}

.stat-card--purple {
  background: linear-gradient(180deg, rgba(40, 25, 52, 0.92) 0%, rgba(9, 15, 13, 0.9) 100%);
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 1rem;
}

.chart-card {
  background: rgba(12, 30, 12, 0.9);
  border: 1px solid rgba(126, 213, 111, 0.14);
  border-radius: 24px;
  padding: 1.5rem;
  min-height: 380px;
}

.chart-card--split {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-card__header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.chart-card__header p {
  margin: 0.5rem 0 0;
  color: #9cb88c;
  font-size: 0.95rem;
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .conteudo {
    padding: 20px;
    margin-left: 0;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .status-pill {
    width: fit-content;
    align-self: flex-start;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    min-height: auto;
  }
}

@media (max-width: 600px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }

  .status-pill {
    width: 100%;
    justify-content: center;
  }

  .chart-card {
    padding: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
  }
}


.chip {
  background: rgba(126, 213, 111, 0.12);
  border: 1px solid rgba(126, 213, 111, 0.22);
  color: #d6f7c8;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  font-size: 0.8rem;
}

.bar-chart {
  display: grid;
  gap: 1rem;
}

.bar-row {
  display: grid;
  gap: 0.75rem;
}

.bar-info {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  color: #d7edc8;
}

.bar-track {
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(126, 213, 111, 1), rgba(47, 215, 108, 0.72));
  border-radius: 999px;
}

.price-list {
  display: grid;
  gap: 1rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(22, 44, 16, 0.85);
  border: 1px solid rgba(126, 213, 111, 0.1);
  transition: background 0.2s ease;
}

.price-item:hover {
  background: rgba(33, 71, 27, 0.95);
}

.price-name {
  display: block;
  color: #eef2e5;
  font-weight: 600;
}

.price-subtitle {
  margin: 0.35rem 0 0;
  color: #a0b194;
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .conteudo {
    padding: 20px;
    margin-left: 0;
  }

  .shell {
    flex-direction: column;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>