<template>
  <div id="pdf-report" class="pdf">

    <PdfHeader :report="report" />

    <PdfKpis :report="report" />

    <PdfOperationalTable :report="report" />

    <PdfCharts :report="report" />

    <PdfRanking :report="report" />

    <PdfAlerts :report="report" />

    <PdfFooter :report="report" />

  </div>
</template>

<script setup>
import PdfHeader from './PdfHeader.vue'
import PdfKpis from './PdfKpis.vue'
import PdfOperationalTable from './PdfOperationalTable.vue'
import PdfCharts from './PdfCharts.vue'
import PdfRanking from './PdfRanking.vue'
import PdfAlerts from './PdfAlerts.vue'
import PdfFooter from './PdfFooter.vue'

defineProps({
  report: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.pdf {
  box-sizing: border-box;
  width: 1300px;
  min-height: 100%;
  padding: 15px;
  background: #ffffff;
  color: #172219;
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-family: 'Inter', Arial, sans-serif;
}
</style>
