const assert = require('node:assert/strict')
const {test} = require('node:test')

const {buildCreateContractFeedback} = require('../../../react/utils/createContractFeedback')

const translate = (key, params = {}) => {
  const map = {
    createdSuccessfully: 'Contract created successfully',
    createdWithInheritedProducts: `Contract created with ${params.copiedProductsCount} product(s) inherited from the latest proposal`,
    noInheritedProducts:
      'No products were inherited because no items were found on the latest proposal',
  }
  return map[key] || key
}

test('success with inherited products and no warnings', () => {
  const result = buildCreateContractFeedback({
    copiedProductsCount: 3,
    warningMessages: [],
    translate,
  })
  assert.ok(result.successMessage.includes('3 product(s)'))
  assert.equal(result.warningMessage, '')
  assert.equal(result.infoMessage, '')
})

test('success without products shows info', () => {
  const result = buildCreateContractFeedback({
    copiedProductsCount: 0,
    warningMessages: [],
    translate,
  })
  assert.equal(result.successMessage, 'Contract created successfully')
  assert.ok(result.infoMessage.includes('No products were inherited'))
  assert.equal(result.warningMessage, '')
})

test('warnings keep success and surface warning text', () => {
  const result = buildCreateContractFeedback({
    copiedProductsCount: 0,
    warningMessages: ['pedido vinculado falhou', 'produtos falharam'],
    translate,
  })
  assert.equal(result.successMessage, 'Contract created successfully')
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
  assert.equal(result.successMessage, 'Contract created successfully')
})
