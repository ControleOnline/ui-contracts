const assert = require('node:assert/strict')
const {test} = require('node:test')

const {
  resolveClientContractsEmptyState,
  resolveContractsListEmptyState,
  PT_FALLBACKS,
} = require('../../../react/utils/contractEmptyState')

function humanize(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
}

test('uses registered-empty keys when there are no filters', () => {
  const calls = []
  const state = resolveContractsListEmptyState({
    translate: (...args) => {
      calls.push(args)
      return humanize(args[2])
    },
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_registered_title'],
    ['contract', 'empty', 'none_registered_subtitle'],
  ])
  assert.equal(state.title, PT_FALLBACKS.none_registered_title)
  assert.equal(state.subtitle, PT_FALLBACKS.none_registered_subtitle)
})

test('uses not-found keys when the search query filters the list', () => {
  const calls = []
  const state = resolveContractsListEmptyState({
    hasSearchQuery: true,
    translate: (...args) => {
      calls.push(args)
      return humanize(args[2])
    },
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_found_title'],
    ['contract', 'empty', 'none_found_subtitle'],
  ])
  assert.equal(state.title, PT_FALLBACKS.none_found_title)
  assert.equal(state.subtitle, PT_FALLBACKS.none_found_subtitle)
})

test('uses status-specific keys when a status filter is active', () => {
  const calls = []
  const state = resolveContractsListEmptyState({
    hasSearchQuery: true,
    hasStatusFilter: true,
    translate: (...args) => {
      calls.push(args)
      return humanize(args[2])
    },
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_in_status_title'],
    ['contract', 'empty', 'none_in_status_subtitle'],
  ])
  assert.equal(state.title, PT_FALLBACKS.none_in_status_title)
  assert.equal(state.subtitle, PT_FALLBACKS.none_in_status_subtitle)
})

test('reuses the client empty state copy for the customer contracts tab', () => {
  const calls = []
  const state = resolveClientContractsEmptyState((...args) => {
    calls.push(args)
    return humanize(args[2])
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_registered_title'],
    ['contract', 'empty', 'none_registered_subtitle'],
  ])
  assert.equal(state.title, PT_FALLBACKS.none_registered_title)
  assert.equal(state.subtitle, PT_FALLBACKS.none_registered_subtitle)
})

test('keeps real translated values when present', () => {
  const state = resolveClientContractsEmptyState((store, type, key) => {
    if (key === 'none_registered_title') return 'Sem contratos no sistema'
    if (key === 'none_registered_subtitle') return 'Inclua um contrato para começar'
    return key
  })

  assert.equal(state.title, 'Sem contratos no sistema')
  assert.equal(state.subtitle, 'Inclua um contrato para começar')
})
