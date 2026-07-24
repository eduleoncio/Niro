<template>
  <article class="member-card">
    <div class="member-card__avatar-wrap">
      <img :src="avatarUrl" :alt="member.name" class="member-card__avatar" />
    </div>
    <div class="member-card__body">
      <h3 class="member-card__name">{{ member.name }}</h3>
      <p class="member-card__role">
        {{ roleLabel }}<span v-if="member.wallet"> · {{ member.wallet }}</span>
      </p>
    </div>
    <RouterLink class="btn btn--ghost member-card__btn" :to="`/perfil/${encodeURIComponent(member.email)}`">
      Ver perfil
    </RouterLink>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ member: { type: Object, required: true } })

const roleLabels = { confirmacao: 'Confirmação', gerencia: 'Gerência' }
const roleLabel = computed(() => roleLabels[props.member.role] || props.member.role || '')

// Se o cadastro (team_access) tiver avatar_url, usa ele. Senão gera um avatar
// com as iniciais do nome, no mesmo tom do tema.
const avatarUrl = computed(() =>
  props.member.avatar_url ||
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(props.member.name || '')}&backgroundColor=16261c&textColor=eef4ee`
)
</script>

<style scoped>
.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.55rem;
  padding: 1.3rem 1rem 1.1rem;
  border-radius: var(--radius, 0.9rem);
  background: var(--panel, #101d16);
  border: 1px solid var(--line, rgba(255, 255, 255, 0.08));
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.member-card:hover {
  transform: translateY(-2px);
  border-color: var(--jade-dim, rgba(111, 227, 160, 0.16));
}

.member-card__avatar-wrap {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--jade-dim, rgba(111, 227, 160, 0.16));
  background: var(--panel-raised, #16261c);
}

.member-card__avatar { width: 100%; height: 100%; object-fit: cover; display: block; }

.member-card__body { min-width: 0; }
.member-card__name {
  font-size: 1rem;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.member-card__role { margin: 0.15rem 0 0; font-size: 0.78rem; color: var(--paper-dim, rgba(238, 244, 238, 0.62)); }

.member-card__btn {
  width: 100%;
  justify-content: center;
  margin-top: 0.4rem;
  font-size: 0.82rem;
  padding: 0.55rem 0.8rem;
}
</style>