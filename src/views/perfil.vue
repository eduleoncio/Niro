<template>
  <main class="perfil-page">
    <section class="perfil-card">
      <div class="perfil-card__header">
        <div class="perfil-card__avatar">AP</div>
        <div class="perfil-card__header-info">
          <span class="perfil-card__section">Perfil</span>
          <h1 class="perfil-card__name">Ana Paula</h1>
          <p class="perfil-card__role">Professora de Química</p>
        </div>
      </div>

      <div class="perfil-card__fields">
        <div class="perfil-field">
          <label>Nome</label>
          <input readonly value="Ana Paula" />
        </div>
        <div class="perfil-field">
          <label>Setor</label>
          <input readonly value="Laboratório" />
        </div>
        <div class="perfil-field">
          <label>Cargo</label>
          <input readonly value="Professora de Química" />
        </div>
        <div class="perfil-field">
          <label>Data de Admissão</label>
          <input readonly value="10/11/2025" />
        </div>
        <div class="perfil-field">
          <label>ID</label>
          <input readonly value="AP0804001" />
        </div>
        <div class="perfil-field">
          <label>Telefone</label>
          <input readonly value="(19) 90123-4567" />
        </div>
        <div class="perfil-field">
          <label>Data de Nascimento</label>
          <input readonly value="08/04/2001" />
        </div>
        <div class="perfil-field">
          <label>E-mail</label>
          <input readonly value="ana.paula@senaisc.edu.br" />
        </div>
      </div>

      <div class="perfil-card__actions">
        <button type="button" class="btn btn-edit">Editar Perfil</button>
        <button type="button" class="btn btn-delete">Excluir Perfil</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.perfil-page {
  min-height: 100vh;
  padding: 3rem 2rem;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, rgba(6, 22, 0, 0.95) 0%, rgba(2, 8, 16, 1) 100%);
}

.perfil-card {
  width: min(1100px, 100%);
  background: rgba(18, 26, 38, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(18px);
  padding: 2.5rem;
}

.perfil-card__header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.8rem;
  align-items: center;
  padding-bottom: 1.8rem;
  margin-bottom: 1.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.perfil-card__avatar {
  width: 124px;
  height: 124px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2ad8b7 0%, #10a4ff 100%);
  display: grid;
  place-items: center;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 24px 60px rgba(13, 92, 148, 0.28);
}

.perfil-card__section {
  display: inline-flex;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #b7d2e4;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.perfil-card__name {
  margin: 0;
  font-size: clamp(2rem, 2.7vw, 3rem);
  color: #fff;
}

.perfil-card__role {
  margin: 0.65rem 0 0;
  color: #aac1d8;
  font-size: 1rem;
}

.perfil-card__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.4rem;
}

.perfil-field {
  display: grid;
  gap: 0.65rem;
}

.perfil-field label {
  color: #92a5bd;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}

.perfil-field input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #f4f7fb;
  border-radius: 18px;
  padding: 1rem 1.2rem;
  font-size: 0.98rem;
  outline: none;
}

.perfil-field input:focus {
  border-color: rgba(34, 186, 133, 0.9);
}

.perfil-card__actions {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn {
  min-width: 170px;
  border: none;
  border-radius: 14px;
  padding: 1rem 1.45rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-edit {
  background: #1f642c;
  color: #f4f7fb;
  box-shadow: 0 14px 30px rgba(31, 100, 44, 0.25);
}

.btn-delete {
  background: #c72e39;
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(199, 46, 57, 0.18);
}

@media (max-width: 900px) {
  .perfil-card {
    padding: 2rem;
  }

  .perfil-card__header {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .perfil-card__avatar {
    margin: 0 auto;
  }

  .perfil-card__fields {
    grid-template-columns: 1fr;
  }

  .perfil-card__actions {
    justify-content: center;
  }
}
</style>
