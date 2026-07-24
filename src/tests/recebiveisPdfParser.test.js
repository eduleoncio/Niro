import { describe, expect, it } from 'vitest'
import { parseRecebiveisPdfText } from '../utils/recebiveisPdfParser'

describe('parseRecebiveisPdfText', () => {
  it('extrai valores financeiros de cada categoria do relatório', () => {
    const sampleText = `
      Relatório de carteiras
      Falta Canhoto (até 10 dias) R$ 150.000,00
      Falta Canhoto (até 30 dias) 200.000,00
      Falta Canhoto/Canhoto Recebido (até 10 dias) R$ 50.000,00
      Falta Canhoto/Canhoto Recebido (até 30 dias) 75.000,00
      Canhoto Carimbado (até 10 dias) 30.000,00
      Canhoto Carimbado (até 30 dias) 40.000,00
      Minuta (até última dia útil da semana passada) 25.000,00
    `

    const result = parseRecebiveisPdfText(sampleText)

    expect(result['Falta Canhoto (até 10 dias)']).toBe(150000)
    expect(result['Falta Canhoto (até 30 dias)']).toBe(200000)
    expect(result['Falta Canhoto/Canhoto Recebido (até 10 dias)']).toBe(50000)
    expect(result['Falta Canhoto/Canhoto Recebido (até 30 dias)']).toBe(75000)
    expect(result['Canhoto Carimbado (até 10 dias)']).toBe(30000)
    expect(result['Canhoto Carimbado (até 30 dias)']).toBe(40000)
    expect(result['Minuta (até última dia útil da semana passada)']).toBe(25000)
  })
})
