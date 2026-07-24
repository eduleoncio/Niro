<template>
  <header class="header">

    <div>

      <p class="eyebrow">
        CONTROLE DE RECEBÍVEIS
      </p>

      <h1>
        Relatório Semanal
      </h1>

      <span class="week">
        {{ report.week }}
      </span>

    </div>

    <div class="info">

      <div>
        <small>Carteira</small>
        <strong>{{ report.wallet }}</strong>
      </div>

      <div>
        <small>Analista</small>
        <strong>{{ report.analyst }}</strong>
      </div>

      <div>
        <small>Emitido em</small>
        <strong>{{ today }}</strong>
      </div>

    </div>

  </header>
</template>

<script setup>

import { computed } from 'vue'

const props = defineProps({
    report:Object
})

const today = computed(()=>

    new Date().toLocaleDateString(
        "pt-BR"
    )

)

</script>

<style scoped>

.header{

    display:flex;
    justify-content:space-between;
    align-items:flex-start;

    border-bottom:3px solid #6FE3A0;

    padding-bottom:18px;

}

.eyebrow{

    color:#39A96B;
    font-size:13px;
    font-weight:700;
    letter-spacing:2px;

}

h1{

    margin:6px 0;
    font-size:24px;

}

.week{

    color:#666;

}

.info{

    display:flex;
    gap:20px;

}

.info div{

    display:flex;
    flex-direction:column;

}

small{

    color:#888;
    margin-bottom:5px;

}

strong{

    font-size:14px;

}

</style>