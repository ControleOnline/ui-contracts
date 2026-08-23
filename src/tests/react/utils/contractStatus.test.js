const assert = require('node:assert/strict')
const {test} = require('node:test')

const {
  contractMatchesStatusFilter,
  getContractStatusFilterOptions,
  getContractStatusLabel,
  getContractStatusTranslationKey,
  normalizeContractStatusKey,
} = require('../../../react/utils/contractStatus')

const translate = (store, type, key) => `${store}.${type}.${key}`

test('normalizeContractStatusKey normalizes status values from the backend', () => {
  assert.equal(normalizeContractStatusKey(' Fechado '), 'fechado')
  assert.equal(normalizeContractStatusKey('real_Status'), 'real status')
})

test('getContractStatusTranslationKey maps PT/EN aliases', () => {
  assert.equal(getContractStatusTranslationKey('Assinado'), 'signed')
  assert.equal(getContractStatusTranslationKey('pendente'), 'pending')
  assert.equal(getContractStatusTranslationKey('unknown'), '')
})

test('getContractStatusLabel translates known statuses', () => {
  assert.equal(getContractStatusLabel('pending', translate), 'contract.status.pending')
  assert.equal(getContractStatusLabel('Assinado', translate), 'contract.status.signed')
})

test('getContractStatusLabel falls back for unknown and empty', () => {
  assert.equal(getContractStatusLabel('custom review', translate), 'custom review')
  assert.equal(getContractStatusLabel('', translate), 'contract.label.na')
})

test('getContractStatusFilterOptions exposes the expected public filters', () => {
  assert.deepEqual(
    getContractStatusFilterOptions(translate).map(item => item.key),
    ['realStatus:open', 'realStatus:pending', 'realStatus:closed'],
  )
})

test('contractMatchesStatusFilter compares the normalized real status', () => {
  const contract = {status: {status: 'Aberto', realStatus: 'open'}}

  assert.equal(contractMatchesStatusFilter(contract, 'realStatus:open'), true)
  assert.equal(contractMatchesStatusFilter(contract, 'realStatus:pending'), false)
  assert.equal(contractMatchesStatusFilter(contract, ''), true)
})
