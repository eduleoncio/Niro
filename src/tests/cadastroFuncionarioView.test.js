// mount monta a página Vue no teste
import { mount } from '@vue/test-utils'
// describe, it e expect vêm do Vitest
import { describe, it, expect } from 'vitest'
// Página que será testada
import CadastroFuncionarioView from '../views/CadastroFuncionarioView.vue'
// Grupo de testes da tela
describe('CadastroFuncionarioView', () => {
    // Teste específico: cadastro sem nome
    it('deve mostrar erro quando o nome não for preenchido', async () => {
        // Monta a tela como se estivesse aberta no navegador
        const wrapper = mount(CadastroFuncionarioView)
        // Simula o envio do formulário vazio
        // Correto: trigger('submit')
        await wrapper.find('form').trigger('submit')
        // Verifica se a mensagem apareceu na tela
        expect(wrapper.text()).toContain(
            'O nome do funcionário é obrigatório.'
        )
    })
})