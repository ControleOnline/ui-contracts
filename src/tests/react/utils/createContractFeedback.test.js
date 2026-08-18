const assert = require('node:assert/strict')
const {test} = require('node:test')

const {buildCreateContractFeedback} = require('../../../react/utils/createContractFeedback')

const translate = (key, params = {}) => {
  const map = {
    createdSuccessfully: 'Contrato criado com sucesso',
    createdWithInheritedProducts: `Contrato criado com ${params.copiedProductsCount} produto(s) herdado(s) da ultima proposta`,
    noInheritedProducts:
      'Nenhum produto foi herdado porque nao encontramos itens na ultima proposta',
  }
  return map[key] || key
}

test('success with inherited products and no warnings', () => {
  const result = buildCreateContractFeedback({
    copiedProductsCount: 3,
    warningMessages: [],
    translate,
  })
  assert.ok(result.successMessage.includes('3 produto(s)'))
  assert.equal(result.warningMessage, '')
  assert.equal(result.infoMessage, '')
})

test('success without products shows info', () => {
  const result = buildCreateContractFeedback({
    copiedProductsCount: 0,
    warningMessages: [],
    translate,
  })
  assert.equal(result.successMessage, 'Contrato criado com sucesso')
  assert.ok(result.infoMessage.includes('Nenhum produto'))
  assert.equal(result.warningMessage, '')
})

test('warnings keep success and surface warning text', () => {
  const result = buildCreateContractFeedback({
    copiedProductsCount: 0,
    warningMessages: ['pedido vinculado falhou', 'produtos falharam'],
    translate,
  })
  assert.equal(result.successMessage, 'Contrato criado com sucesso')
  assert.ok(result.warningMessage.includes('pedido vinculado falhou'))
  assert.ok(result.warningMessage.includes('produtos falharam'))
  assert.equal(result.infoMessage, '')
})

test('filters empty warning entries', () => {
  const result = buildCreateContractFeedback({
    copiedProductsCount: 1,
    warningMessages: ['', '  ', 'real warning'],
    translate,
  })
  assert.equal(result.warningMessage, 'real warning')
  assert.equal(result.successMessage, 'Contrato criado com sucesso')
})
