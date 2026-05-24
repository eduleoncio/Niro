<template>
    <div class="layout-container">
        <header class="page-header">
            <div class="header-left">
                <img src="../assets/icon-tela-cadastrarEPI.svg" alt="Cadastrar EPI" class="page-icon" />
                <div>
                    <h1>Informações do Equipamento</h1>
                    <p class="page-subtitle">Preencha todos os campos obrigatórios</p>
                </div>
            </div>
            <div class="header-tag">Novo equipamento</div>
        </header>

        <section class="card card-form">
            <div class="form-grid">
                <div class="form-group">
                    <label>Nome do EPI</label>
                    <input v-model="form.nome_epi" type="text" placeholder="Nome do EPI" required>
                </div>

                <div class="form-group">
                    <label>Categoria</label>
                    <input v-model="form.tipo_epi" type="text" placeholder="Categoria" required>
                </div>

                <div class="form-group">
                    <label>Número do C.A</label>
                    <input v-model="form.ca" type="text" placeholder="C.A" required>
                </div>

                <div class="form-group">
                    <label>Preço unitário (R$)</label>
                    <input v-model="form.preco" type="number" step="0.01" placeholder="Preço unitário (R$)">
                </div>

                <div class="form-group">
                    <label>Quantidade</label>
                    <input v-model="form.quantidade" type="number" placeholder="Quantidade">
                </div>

                <div class="form-group form-group-full">
                    <label>Descrição / Observações</label>
                    <textarea v-model="form.descricao" placeholder="Descrição do EPI"></textarea>
                </div>
            </div>

            <div class="upload-panel" @click="triggerFileSelect">
                <div class="upload-icon">+</div>
                <div>
                    <p>Escolha um arquivo ou arraste e solte aqui</p>
                    <span>JPEG, PNG e SVG aceitos, até 50MB</span>

                    <div v-if="localPreviewUrl" class="upload-preview">
                        <img :src="localPreviewUrl" alt="Preview" />
                        <div class="image-url-preview">Preview: {{ localPreviewUrl }}</div>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary" @click.stop="triggerFileSelect">Procurar
                    arquivo</button>
                <input ref="fileInput" type="file" accept="image/png, image/jpeg, image/svg+xml"
                    @change="handleFileUpload" hidden />
            </div>

            <div class="action-bar">
                <button type="submit" class="btn btn-primary" @click="salvar">
                    {{ editandoId ? 'Salvar Alterações' : 'Cadastrar EPI' }}
                </button>
                <button v-if="editandoId" type="button" @click="cancelarEdicao" class="btn btn-outline">
                    Cancelar
                </button>
            </div>
        </section>

        <section class="card card-list">
            <div class="list-header">
                <div>
                    <h2>Produtos cadastrados</h2>
                    <p>Edite ou remova itens existentes.</p>
                </div>
                <div class="filter-group">
                    <select v-model="filtroTipo">
                        <option value="">Todos</option>
                        <option v-for="t in tiposExistentes" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>
            </div>

            <div class="products-grid">
                <article class="product-card" v-for="e in episFiltrados" :key="e.id">
                    <div class="product-card-top">
                        <img :src="normalizeImageUrl(e.imagem_url) || placeholderImage" :alt="e.nome_epi"
                            @error="onImageError" />
                    </div>
                    <div class="product-card-body">
                        <div class="product-card-title">
                            <div>
                                <h3>{{ e.nome_epi }}</h3>
                                <p>{{ e.tipo_epi || 'Sem categoria' }}</p>
                            </div>
                            <strong>R$ {{ Number(e.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                            }}</strong>
                        </div>
                        <div class="product-card-meta">
                            <span>C.A. {{ e.ca }}</span>
                            <span>{{ e.quantidade || 0 }} unidades</span>
                        </div>
                        <p class="product-card-description">{{ e.descricao || 'Nenhuma descrição registrada.' }}</p>
                    </div>
                    <div class="product-card-actions">
                        <button @click="prepararEdicao(e)" class="btn-icon edit">Editar</button>
                        <button @click="excluir(e.id)" class="btn-icon delete">Excluir</button>
                    </div>
                </article>
            </div>

            <div v-if="episFiltrados.length === 0" class="empty-state">
                Nenhum equipamento encontrado.
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const epis = ref([])
const editandoId = ref(null)
const fileInput = ref(null)

const form = reactive({
    nome_epi: '',
    tipo_epi: '',
    ca: '',
    descricao: '',
    preco: '',
    quantidade: '',
    imagem_url: ''
})

const imagemFile = ref(null)
const localPreviewUrl = ref(null)

const placeholderImage = 'https://via.placeholder.com/300x200?text=Sem+imagem'

const normalizeImageUrl = (url) => {
    if (!url || typeof url !== 'string') return url
    return url.replace('/public/epis/', '/public/assets-epis/')
}

const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // revoke previous preview if any
    if (localPreviewUrl.value) {
        try { URL.revokeObjectURL(localPreviewUrl.value) } catch (e) { }
    }

    imagemFile.value = file
    localPreviewUrl.value = URL.createObjectURL(file)
}

const triggerFileSelect = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

// 🔥 carregar dados
const carregar = async () => {
    const { data } = await supabase
        .from('epis')
        .select('*')
        .order('nome_epi')

    epis.value = (data || []).map(item => {
        if (item && item.imagem_url) {
            item.imagem_url = normalizeImageUrl(item.imagem_url)
        }
        return item
    })
    carregarTipos()
}

// 🔥 salvar (insert ou update)
const salvar = async () => {
    let imageUrl = null

    if (imagemFile.value) {
        const fileName = `${Date.now()}_${imagemFile.value.name}`
        const bucket = 'assets-epis'

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, imagemFile.value, {
                cacheControl: '3600',
                upsert: true,
                contentType: imagemFile.value.type
            })

        if (uploadError) {
            console.error(`Upload failed on bucket ${bucket}:`, uploadError)
            alert('Falha ao enviar imagem. Verifique as permissões do bucket de storage e se você está autenticado.')
            return
        }

        const { data: publicUrlData, error: publicUrlError } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

        if (publicUrlError) {
            console.error('Erro ao obter URL pública:', publicUrlError)
            alert('Falha ao obter a URL da imagem. Tente novamente.')
            return
        }

        imageUrl = publicUrlData.publicUrl
    }

    const dados = {
        ...form,
        preco: form.preco ? Number(form.preco) : 0,
        quantidade: form.quantidade ? Number(form.quantidade) : 0,
        imagem_url: imageUrl || form.imagem_url
    }

    let response

    if (editandoId.value) {
        response = await supabase
            .from('epis')
            .update(dados)
            .eq('id', editandoId.value)
    } else {
        response = await supabase
            .from('epis')
            .insert([dados])
    }

    if (response.error) {
        console.error('ERRO AO SALVAR:', response.error)
        alert('Erro ao salvar: ' + response.error.message)
        return
    }

    cancelarEdicao()
    carregar()
}

// 🔥 preparar edição
const prepararEdicao = (e) => {
    editandoId.value = e.id

    Object.assign(form, {
        nome_epi: e.nome_epi,
        tipo_epi: e.tipo_epi,
        ca: e.ca,
        descricao: e.descricao,
        preco: e.preco,
        quantidade: e.quantidade,
        imagem_url: e.imagem_url
    })
}

const excluir = async (id) => {
    if (confirm('Deseja excluir este equipamento?')) {
        await supabase.from('epis').delete().eq('id', id)
        carregar()
    }
}

// 🔥 cancelar edição
const cancelarEdicao = () => {
    editandoId.value = null

    Object.assign(form, {
        nome_epi: '',
        tipo_epi: '',
        ca: '',
        descricao: '',
        preco: '',
        quantidade: '',
        imagem_url: ''
    })

    imagemFile.value = null
    if (localPreviewUrl.value) {
        try { URL.revokeObjectURL(localPreviewUrl.value) } catch (e) { }
        localPreviewUrl.value = null
    }
}

const tiposExistentes = ref([])

const carregarTipos = () => {
    const tipos = epis.value.map(e => e.tipo_epi)
    tiposExistentes.value = [...new Set(tipos)]
}

const onImageError = (event) => {
    event.target.src = placeholderImage
}

const filtroTipo = ref('')

const episFiltrados = computed(() => {
    if (!filtroTipo.value) return epis.value

    return epis.value.filter(e =>
        e.tipo_epi === filtroTipo.value
    )
})

onMounted(carregar)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

.layout-container {
    padding: 2rem;
    min-height: 100vh;
    font-family: 'Montserrat', sans-serif;

}

.page-header {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 1.75rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 32px;
    backdrop-filter: blur(20px);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.page-header h1 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.1;
}

.page-subtitle {
    margin: 0.5rem 0 0;
    color: #7f7f7f;
}

.header-tag {
    background: rgba(126, 213, 111, 0.08);
    border: 1px solid rgba(126, 213, 111, 0.16);
    color: #d7f7c7;
    padding: 0.95rem 1.2rem;
    border-radius: 16px;
    font-size: 0.95rem;
    white-space: nowrap;
}

.card {
    padding: 1.75rem;
    margin-bottom: 1.75rem;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 32px;
    backdrop-filter: blur(20px);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group-full {
    grid-column: 1 / -1;
}

label {
    color: #c9e3c3;
    font-size: 0.9rem;
    font-family: 'Montserrat', sans-serif;
}

input,
textarea,
select {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1rem 1.1rem;
    color: #f8fbf5;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
    font-family: 'Montserrat', sans-serif;
}

select {
    color: #f8fbf5;
    background: rgba(255, 255, 255, 0.05);
}

select option {
    background: #0a1112;
    color: #f8fbf5;
}

select:focus option {
    background: #0a1112;
}

textarea {
    min-height: 2rem;
    resize: vertical;

}

input:focus,
textarea:focus,
select:focus {
    border-color: rgba(126, 213, 111, 0.7);
    background: rgba(255, 255, 255, 0.08);
}

input::placeholder,
textarea::placeholder {
    color: rgba(255, 255, 255, 0.45);
}

.upload-panel {
    margin-top: 1.5rem;
    border: 2px dashed rgba(126, 213, 111, 0.45);
    border-radius: 24px;
    padding: 2rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    align-items: center;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-panel:hover {
    background: rgba(126, 213, 111, 0.06);
    border-color: rgba(126, 213, 111, 0.8);
}

.upload-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: rgba(126, 213, 111, 0.14);
    color: #7ed56f;
    font-size: 1.75rem;
    font-weight: 700;
}

.upload-panel p {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #f4f9ed;
}

.upload-panel span {
    color: #a9cfa3;
    font-size: 0.9rem;
}

.action-bar {
    margin-top: 1.75rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn {
    border-radius: 14px;
    cursor: pointer;
    border: none;
    font-weight: 700;
    padding: 0.95rem 1.5rem;
    transition: transform 0.2s ease, filter 0.2s ease;
    width: 100%;
}

.btn:hover {
    transform: translateY(-1px);
}

.btn-primary {
    background: linear-gradient(135deg, #126b28, #2a8c3f);
    color: #fff;
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #e7f3dc;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-outline {
    background: transparent;
    color: #d7f7c7;
    border: 1px solid rgba(255, 255, 255, 0.12);
}

.card-list {
    padding-top: 1rem;
}

.list-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
}

.list-header h2 {
    margin: 0;
    color: #f8fbf5;
}

.list-header p {
    margin: 0.4rem 0 0;
    color: #b9c7ad;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

}

.filter-group select {
    max-width: auto;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
}

.product-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.product-card-top img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.product-card-title {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
}

.product-card-title h3 {
    margin: 0;
    font-size: 1.05rem;
}

.product-card-title p {
    margin: 0.35rem 0 0;
    color: #a8c1a1;
    font-size: 0.95rem;
}

.product-card-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: #c4d4b9;
    font-size: 0.92rem;
}

.product-card-description {
    margin: 0;
    color: #d9e7c8;
    font-size: 0.95rem;
    line-height: 1.5;
}

.product-card-actions {
    padding: 0 1.25rem 1.25rem;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.btn-icon {
    border: none;
    border-radius: 14px;
    padding: 0.85rem 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.btn-icon:hover {
    transform: translateY(-1px);
}

.btn-icon.edit {
    background: rgba(126, 213, 111, 0.15);
    color: #d7f7c7;
}

.btn-icon.delete {
    background: rgba(190, 18, 60, 0.16);
    color: #f3b1b5;
}

.empty-state {
    padding: 2rem;
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: #b7c7a2;
    text-align: center;
}

@media (max-width: 1100px) {

    .form-grid,
    .products-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 760px) {
    .layout-container {
        padding: 1rem;
    }

    .page-header {
        flex-direction: column;
        align-items: stretch;
    }

    .header-tag {
        width: fit-content;
    }

    .upload-panel {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .upload-panel button {
        justify-self: center;
    }

    .list-header {
        flex-direction: column;
        align-items: stretch;
    }
}

.upload-preview {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.upload-preview img {
    width: 72px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
}

.image-url-preview {
    font-size: 0.8rem;
    color: #c9e3c3;
    max-width: 240px;
    word-break: break-all;
}

.image-url {
    margin-top: 0.5rem;
    padding: 0 1rem 0.75rem 1rem;
    font-size: 0.78rem;
    color: #b9c7ad;
    word-break: break-all;
}
</style>