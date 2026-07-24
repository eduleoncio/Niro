function baixarPdf() {
  const r = reportComparison.value
  if (!r) return

  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()

  // =========================
  // CORES
  // =========================

  const green = [111, 227, 160]
  const blue = [127, 182, 227]
  const dark = [16, 29, 22]
  const light = [245, 248, 245]

  // Fundo
  doc.setFillColor(...light)
  doc.rect(0,0,210,297,"F")

  // Header
  doc.setFillColor(...dark)
  doc.rect(0,0,210,30,"F")

  doc.setTextColor(255,255,255)
  doc.setFont("helvetica","bold")
  doc.setFontSize(20)

  doc.text("CONTROLE DE RECEBÍVEIS",14,15)

  doc.setFontSize(10)
  doc.setFont("helvetica","normal")
  doc.text(r.weekLabel,14,22)

  doc.text(`Carteira: ${r.wallet}`,150,15)

  doc.text(r.emittedAt,150,22)

  //==========================
  // Cards
  //==========================

  let y = 40

  function drawCard(x,title,value,color){

      doc.setFillColor(...color)
      doc.roundedRect(x,y,42,22,2,2,"F")

      doc.setTextColor(255)

      doc.setFontSize(8)
      doc.text(title,x+3,y+7)

      doc.setFontSize(11)
      doc.setFont("helvetica","bold")
      doc.text(value,x+3,y+15)

  }

  drawCard(
      14,
      "TOTAL INÍCIO",
      formatCurrency(r.startTotal),
      green
  )

  drawCard(
      60,
      "TOTAL FINAL",
      formatCurrency(r.endTotal),
      blue
  )

  drawCard(
      106,
      "TOTAL BAIXADO",
      formatCurrency(r.startTotal-r.endTotal),
      [63,156,107]
  )

  drawCard(
      152,
      "VARIAÇÃO",
      `${r.totalDelta>0?'+':''}${formatCurrency(r.totalDelta)}`,
      r.totalDelta<=0
      ? [52,168,83]
      : [220,53,69]
  )

  //==========================
  // Banner
  //==========================

  y=72

  doc.setFillColor(230,246,235)

  doc.roundedRect(14,y,182,18,3,3,"F")

  doc.setTextColor(30)

  doc.setFontSize(11)

  doc.text(
      `${r.fim.analyst_name} confirmou ${formatCurrency(r.startTotal-r.endTotal)} da carteira ${r.wallet}`,
      18,
      y+11
  )

  //==========================
  // Resumo
  //==========================

  y=98

  doc.setFontSize(15)
  doc.setFont("helvetica","bold")
  doc.text("Resumo Executivo",14,y)

  y+=8

  if(r.biggestDrop){

      doc.setTextColor(34,139,34)

      doc.text(
      `Maior queda: ${r.biggestDrop.key}`,
      14,
      y)

      y+=6

      doc.text(
      formatCurrency(r.biggestDrop.delta),
      20,
      y)

      y+=10
  }

  if(r.biggestRise){

      doc.setTextColor(200,40,40)

      doc.text(
      `Maior aumento: ${r.biggestRise.key}`,
      14,
      y)

      y+=6

      doc.text(
      "+"+formatCurrency(r.biggestRise.delta),
      20,
      y)

      y+=10
  }

  doc.setTextColor(30)

  //==========================
  // ALERTAS
  //==========================

  if(r.alertas.length){

      doc.setFontSize(14)
      doc.text("Alertas",14,y)

      y+=6

      autoTable(doc,{

          startY:y,

          head:[["Categoria","Carteira","Aumento"]],

          headStyles:{
              fillColor:[220,53,69]
          },

          body:r.alertas.map(a=>[
              a.key,
              a.portfolio,
              formatCurrency(a.delta)
          ])

      })

      y=doc.lastAutoTable.finalY+10

  }

  //==========================
  // Tabela FIDC
  //==========================

  autoTable(doc,{

      startY:y,

      head:[[
          "FIDC",
          "Início",
          "Fim",
          "Variação"
      ]],

      headStyles:{
          fillColor:green,
          textColor:20
      },

      alternateRowStyles:{
          fillColor:[248,248,248]
      },

      body:r.fidcRows.map(row=>[

          row.key,

          formatCurrency(row.start),

          formatCurrency(row.end),

          `${row.delta>0?'+':''}${formatCurrency(row.delta)}`

      ])

  })

  y=doc.lastAutoTable.finalY+8

  //==========================
  // Tabela Factor
  //==========================

  autoTable(doc,{

      startY:y,

      head:[[
          "FACTOR",
          "Início",
          "Fim",
          "Variação"
      ]],

      headStyles:{
          fillColor:blue,
          textColor:20
      },

      alternateRowStyles:{
          fillColor:[248,248,248]
      },

      body:r.factorRows.map(row=>[

          row.key,

          formatCurrency(row.start),

          formatCurrency(row.end),

          `${row.delta>0?'+':''}${formatCurrency(row.delta)}`

      ])

  })

  //==========================
  // Rodapé
  //==========================

  const pages = doc.getNumberOfPages()

  for(let i=1;i<=pages;i++){

      doc.setPage(i)

      doc.setDrawColor(180)

      doc.line(14,287,196,287)

      doc.setFontSize(9)

      doc.setTextColor(120)

      doc.text(
          `Sistema Controle de Recebíveis`,
          14,
          292
      )

      doc.text(
          `Página ${i} de ${pages}`,
          170,
          292
      )

  }

  doc.save(`Relatorio-${r.wallet}-${r.weekStart}.pdf`)
}