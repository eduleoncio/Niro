<template>
  <section class="funcionarios-page">
    <div class="panel">
      <header class="panel-header">
        <h2>Filtros</h2>
        <div class="filters-row">
          <select v-model="filters.setor" class="filter-input">
            <option value="">Todos os setores</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Qualidade">Qualidade</option>
            <option value="Segurança">Segurança</option>
          </select>

          <input v-model="filters.nome" placeholder="Ex.: Ana Paula" class="filter-input" />
          <input v-model="filters.matricula" placeholder="Matrícula" class="filter-input" />
          <input v-model="filters.cargo" placeholder="Cargo" class="filter-input" />

          <button class="btn-clear" @click="clearFilters">Limpar Filtros</button>
        </div>
      </header>

      <div class="cards-area">
        <div class="employee-card" v-for="emp in filteredEmployees" :key="emp.id">
          <div class="avatar-wrap">
            <img v-if="emp.avatarUrl" :src="emp.avatarUrl" alt="Avatar" class="avatar" />
            <div v-else class="avatar avatar--initials">{{ initials(emp.name) }}</div>
          </div>
          <div class="employee-info">
            <div class="employee-name">{{ emp.name }}</div>
            <div class="employee-role">{{ emp.role }}</div>
          </div>
          <button class="btn-visit" @click="visitProfile(emp.id)">Visitar Perfil</button>
        </div>

        <div v-if="filteredEmployees.length === 0" class="empty">Nenhum funcionário encontrado.</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const router = useRouter()
const { supabase } = useSupabase()

const filters = ref({
  setor: '',
  nome: '',
  matricula: '',
  cargo: ''
})

const employees = ref([])

async function carregarFuncionarios() {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')

  if (error) {
    console.error('Erro ao buscar funcionários:', error)
    return
  }

  console.log(data)

  employees.value = data.map(func => ({
    // usar codigo_funcionario como identificador
    id: func.codigo_funcionario,

    // nome da pessoa
    name: func.nome,

    // cargo
    role: func.cargo,

    // matrícula
    matricula: func.matricula,

    // setor
    setor: func.setor,

    // você não tem avatar salvo ainda
    avatarUrl: null
  }))
}

onMounted(() => {
  carregarFuncionarios()
})

const filteredEmployees = computed(() => {
  const f = filters.value

  return employees.value.filter((e) => {
    const matchesSetor =
      !f.setor || e.setor.toLowerCase().includes(f.setor.toLowerCase())

    const matchesNome =
      !f.nome || e.name.toLowerCase().includes(f.nome.toLowerCase())

    const matchesMatricula =
      !f.matricula ||
      e.matricula.toLowerCase().includes(f.matricula.toLowerCase())

    const matchesCargo =
      !f.cargo || e.role.toLowerCase().includes(f.cargo.toLowerCase())

    return (
      matchesSetor &&
      matchesNome &&
      matchesMatricula &&
      matchesCargo
    )
  })
})

function clearFilters() {
  filters.value = {
    setor: '',
    nome: '',
    matricula: '',
    cargo: ''
  }
}

function initials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
}

function visitProfile(id) {
  router.push(`/dashboard/funcionarios/${id}`)
}
</script>

<style scoped>
.funcionarios-page {
  padding: 1.75rem;
  min-height: 100vh;
  box-sizing: border-box;
}

.panel {
  background: #0f1413;
  padding: 1.5rem;
  border-radius: 0.75rem;
  min-height: calc(100vh - 3.5rem);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.02) inset;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-header h2 {
  color: #dfeee0;
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
}

.filters-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-input {
  background: #16221c;
  border: 1px solid rgba(64,137,60,0.2);
  color: #dfeee0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  outline: none;
  min-width: 10rem;
}

.btn-clear {
  margin-left: auto;
  background: #c0392b;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.cards-area {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 1.25rem;
}

.employee-card {
  background: #0b100f;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(255,255,255,0.02);
}

.avatar-wrap { width: 4.5rem; height: 4.5rem; }
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  display: block;
}
.avatar--initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(64,137,60,0.12), rgba(64,137,60,0.06));
  color: #dfeee0;
  font-weight: 600;
  font-size: 1rem;
}

.employee-name {
  color: #e8f7ea;
  font-weight: 700;
  text-align: center;
}
.employee-role {
  color: rgba(255,255,255,0.45);
  font-size: 0.875rem;
  text-align: center;
}

.btn-visit {
  background: transparent;
  border: 1px solid rgba(64,137,60,0.9);
  color: #dfeee0;
  padding: 0.4rem 0.6rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.empty {
  color: rgba(255,255,255,0.3);
  grid-column: 1/-1;
  padding: 2rem 0;
  text-align: center;
}

@media (max-width: 768px) {
  .filters-row { gap: 0.5rem; }
  .filter-input { min-width: 8rem; }
  .cards-area { grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); }
}

</style>