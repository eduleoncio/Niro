<template>
    <header class="topbar">
        <div class="topbar-actions">
            <button class="icon-btn" title="Configurações">
                <i class="pi pi-cog"></i>
            </button>

            <button class="icon-btn" title="Notificações">
                <i class="pi pi-bell"></i>
                <span class="badge"></span>
            </button>

            <div class="profile">
                <img src="/avatar.png" alt="Perfil" />
            </div>
        </div>
    </header>
</template>

<script setup>
</script>

<style scoped>
.topbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 1rem 2rem;
}

.topbar-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.icon-btn {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    color: white;
    cursor: pointer;
    position: relative;
}

.icon-btn:hover {
    background: rgba(255, 255, 255, 0.12);
}

.badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
}

.profile img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid #22c55e;
    cursor: pointer;
}
</style>