<template>
  <section class="team-grid-wrap">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="loadError" class="error-banner">{{ loadError }}</p>
    <div v-else class="team-grid">
      <TeamMemberCard v-for="m in members" :key="m.email" :member="m" />
    </div>
    <p v-if="!loadError && !members.length" class="info-message">Nenhum membro cadastrado ainda.</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import TeamMemberCard from './TeamMemberCard.vue'

defineProps({ title: { type: String, default: 'Equipe' } })

const { supabase } = useSupabase()
const members = ref([])
const loadError = ref('')

async function load() {
  loadError.value = ''
  try {
    const { data: people, error } = await supabase.from('team_access').select('*')
    if (error) throw error

    const { data: walletRows, error: walletError } = await supabase
      .from('analyst_wallets')
      .select('email, wallet')
    if (walletError) throw walletError

    const walletByEmail = new Map()
    ;(walletRows || []).forEach(r => {
      const list = walletByEmail.get(r.email) || []
      list.push(r.wallet)
      walletByEmail.set(r.email, list)
    })

    members.value = (people || []).map(p => ({
      ...p,
      wallet: (walletByEmail.get(p.email) || []).join(', ')
    }))
  } catch (e) {
    console.error(e)
    loadError.value = 'Não foi possível carregar a equipe.'
  }
}

onMounted(load)
</script>

<style scoped>
.team-grid-wrap { display: grid; gap: 1rem; }

.team-grid-wrap h2 {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
}

.error-banner {
  margin: 0;
  padding: 0.9rem 1.1rem;
  border-radius: 0.7rem;
  background: rgba(255, 148, 148, 0.1);
  border: 1px solid rgba(255, 148, 148, 0.35);
  color: var(--bad, #ff9797);
}

.info-message {
  margin: 0;
  padding: 0.9rem 1.1rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--paper-dim, rgba(238, 244, 238, 0.62));
  border-left: 3px solid var(--steel, #7fb6e3);
}
</style>