<template>
    <section class="retirar-page">
        <div class="retirar-panel">
            <header class="retirar-header">
                <div>
                    <p class="subtitle">Informações da Retirada</p>
                    <h1>Preencha todos os campos obrigatórios</h1>
                </div>
            </header>

            <form class="retirar-form" @submit.prevent="submitRetirada">
                <div class="field-card">
                    <label>Nome do EPI</label>
                    <input v-model="form.nomeEpi" type="text" placeholder="Nome do EPI" required />
                </div>

                <div class="field-card">
                    <label>Categoria</label>
                    <input v-model="form.categoria" type="text" placeholder="Categoria" required />
                </div>

                <div class="field-card">
                    <label>Quantidade</label>
                    <input v-model.number="form.quantidade" type="number" min="1" placeholder="Quantidade" required />
                </div>

                <div class="field-card">
                    <label>Data de Retirada</label>
                    <input v-model="form.dataRetirada" type="date" required />
                </div>

                <div class="field-card field-card--full">
                    <label>Nome do funcionário/aluno</label>
                    <input v-model="form.nomeResponsavel" type="text" placeholder="Nome do funcionário/aluno"
                        required />
                </div>

                <div class="field-card field-card--full">
                    <label>Descrição/Observações</label>
                    <textarea v-model="form.descricao" placeholder="Descrição/Observações"></textarea>
                </div>

                <button type="submit" class="submit-button">Retirar EPI</button>
            </form>
        </div>
    </section>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const STORAGE_KEY = 'epi-fichas'

const form = reactive({
    nomeEpi: '',
    categoria: '',
    quantidade: 1,
    dataRetirada: '',
    nomeResponsavel: '',
    descricao: ''
})

function getFichas() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
        return []
    }
}

function saveFicha(ficha) {
    const fichas = getFichas()
    fichas.unshift(ficha)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fichas))
}

function submitRetirada() {
    const ficha = {
        id: Date.now(),
        nomeEpi: form.nomeEpi.trim(),
        categoria: form.categoria.trim(),
        quantidade: form.quantidade,
        dataRetirada: form.dataRetirada,
        nomeResponsavel: form.nomeResponsavel.trim(),
        descricao: form.descricao.trim(),
        devolucoes: 0,
        createdAt: new Date().toISOString()
    }

    saveFicha(ficha)
    router.push('/dashboard/rastrearEPI')
}
</script>

<style scoped>
.retirar-page {
    padding: 1.2rem;
    min-height: auto;
    box-sizing: border-box;
}

.retirar-panel {
    max-width: 68rem;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 32px;
    backdrop-filter: blur(20px);
}

.retirar-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.subtitle {
    margin: 0;
    color: #7c9c7c;
    font-size: 0.95rem;
}

.retirar-header h1 {
    margin: 0;
    color: #f7faf6;
    font-size: 1.8rem;
}

.retirar-form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    font-family: 'Montserrat', sans-serif;
}

.field-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-card--full {
    grid-column: 1 / -1;
}

.field-card label {
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.95rem;
}

.field-card input,
.field-card textarea {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #f3f7f2;
    padding: 1rem;
    border-radius: 1rem;
    outline: none;
    font-family: 'Montserrat', sans-serif;

}

.field-card input::placeholder,
.field-card textarea::placeholder {
    color: rgba(255, 255, 255, 0.35);
}

.field-card textarea {
    min-height: 5rem;
    resize: vertical;
}

.submit-button {
    grid-column: 1 / -1;
    margin-top: 0.5rem;
    padding: 1rem 1.5rem;
    background: #2aa240;
    color: #fff;
    border: none;
    border-radius: 1rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
}

.submit-button:hover {
    background: #249537;
}

@media (max-width: 900px) {
    .retirar-form {
        grid-template-columns: 1fr;
    }
}
</style>
