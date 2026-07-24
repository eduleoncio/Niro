<template>
  <div class="c-select" ref="rootRef">
    <button type="button" class="c-select__trigger" @click="open = !open" :aria-expanded="open">
      <span>{{ selectedLabel || placeholder }}</span>
      <svg class="c-select__chevron" :class="{ 'c-select__chevron--open': open }" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div v-if="open" class="c-select__panel">
      <template v-for="(entry, i) in flatList" :key="i">
        <p v-if="entry.isGroup" class="c-select__group">{{ entry.label }}</p>
        <button
          v-else
          type="button"
          class="c-select__option"
          :class="{ 'c-select__option--active': entry.value === modelValue }"
          @click="choose(entry.value)"
        >
          {{ entry.label }}
        </button>
      </template>
      <p v-if="!flatList.length" class="c-select__empty">Nenhuma opção</p>
    </div>
  </div>
</template>

<script setup>
/*
  Substitui o <select> nativo. Em vários navegadores/SO o <select> ignora
  color-scheme: dark e renderiza as opções com fundo branco — como o texto
  herdava a cor clara (var(--paper)), ficava "tudo branco, ilegível".
  Este componente desenha o próprio painel, então a cor é sempre garantida.

  Aceita duas formas em `options`:
  - lista simples: ['A', 'B'] ou [{ value, label }]
  - com grupos: [{ groupLabel: 'Carteiras', options: [...] }, { groupLabel: 'Conferência', options: [...] }]
*/
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecionar' }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const rootRef = ref(null)

function normalizeItem(item) {
  return typeof item === 'object' && item !== null && 'value' in item
    ? item
    : { value: item, label: String(item) }
}

const flatList = computed(() => {
  const out = []
  props.options.forEach(entry => {
    if (entry && entry.groupLabel) {
      out.push({ isGroup: true, label: entry.groupLabel })
      ;(entry.options || []).forEach(o => out.push(normalizeItem(o)))
    } else {
      out.push(normalizeItem(entry))
    }
  })
  return out
})

const selectedLabel = computed(() => {
  const found = flatList.value.find(o => !o.isGroup && o.value === props.modelValue)
  return found?.label || ''
})

function choose(value) {
  emit('update:modelValue', value)
  open.value = false
}

function handleClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.c-select { position: relative; width: 100%; }

.c-select__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.55rem;
  border: 1px solid var(--line, rgba(255, 255, 255, 0.08));
  background: rgba(255, 255, 255, 0.04);
  color: var(--paper, #eef4ee);
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.c-select__trigger:hover { background: rgba(255, 255, 255, 0.07); }
.c-select__trigger:focus-visible { outline: 2px solid var(--jade, #6fe3a0); outline-offset: 1px; }

.c-select__chevron { color: var(--paper-dim, rgba(238, 244, 238, 0.62)); transition: transform 0.15s ease; flex-shrink: 0; }
.c-select__chevron--open { transform: rotate(180deg); }

.c-select__panel {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  z-index: 30;
  display: grid;
  gap: 0.1rem;
  padding: 0.4rem;
  border-radius: 0.7rem;
  background: var(--panel-raised, #16261c);
  border: 1px solid var(--line, rgba(255, 255, 255, 0.08));
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  max-height: 260px;
  overflow-y: auto;
}

.c-select__group {
  margin: 0;
  padding: 0.4rem 0.6rem 0.15rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paper-dim, rgba(238, 244, 238, 0.62));
}

.c-select__option {
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  color: var(--paper, #eef4ee);
  cursor: pointer;
  font-family: inherit;
}

.c-select__option:hover { background: rgba(255, 255, 255, 0.06); }
.c-select__option--active { color: var(--jade, #6fe3a0); background: var(--jade-dim, rgba(111, 227, 160, 0.16)); }

.c-select__empty { margin: 0; padding: 0.6rem; color: var(--paper-dim, rgba(238, 244, 238, 0.62)); font-size: 0.82rem; }
</style>