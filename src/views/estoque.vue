<template>
  <div class="grid-cards">
    <div v-for="epi in epis" :key="epi.id" class="card-epi">

      <div class="card-image">
        <img :src="epi.imagem_url || placeholderImage" :alt="epi.nome_epi || 'EPI'" loading="lazy"
          @error="onImageError" />
      </div>

      <div class="card-body">
        <h3>{{ epi.nome_epi }}</h3>

        <div class="info">
          <span>Preço</span>
          <strong>R$ {{ Number(epi.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</strong>
        </div>

        <div class="info">
          <span>Qtd. Estoque</span>
          <strong>{{ epi.quantidade || 0 }} unidades</strong>
        </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const epis = ref([])

const placeholderImage = 'https://via.placeholder.com/300x200?text=Sem+Imagem'

const carregarEPIs = async () => {
  const { data, error } = await supabase
    .from('epis')
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  // Atualiza possíveis URLs públicas que usam o bucket antigo 'epis'
  // Ex.: https://<proj>.supabase.co/storage/v1/object/public/epis/arquivo.jpg
  // -> https://<proj>.supabase.co/storage/v1/object/public/assets-epis/arquivo.jpg
  epis.value = (data || []).map(item => {
    if (item && item.imagem_url && typeof item.imagem_url === 'string') {
      item.imagem_url = item.imagem_url.replace('/public/epis/', '/public/assets-epis/')
    }
    return item
  })
}

const onImageError = (event) => {
  event.target.src = placeholderImage
}

onMounted(carregarEPIs)
</script>

<style scoped>
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.card-epi {
  background: #0b1d0b;
  border-radius: 25px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: 0.2s;
}

.card-epi:hover {
  transform: translateY(-5px);
}

.card-image {
  background: #091006;
  min-height: auto;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-image img {
  width: auto;
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.card-body {
  padding: 15px;
}

.card-body h3 {
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 5px;
  color: #ccc;
}
</style>