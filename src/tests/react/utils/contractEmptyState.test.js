const assert = require('node:assert/strict')
const {test} = global

const {
  resolveClientContractsEmptyState,
  resolveContractsListEmptyState,
} = require('../../../react/utils/contractEmptyState')

test('uses registered-empty keys when there are no filters', () => {
  const calls = []
  const state = resolveContractsListEmptyState({
    translate: (...args) => {
      calls.push(args)
      return args.join('.')
    },
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_registered_title'],
    ['contract', 'empty', 'none_registered_subtitle'],
  ])
  assert.equal(state.title, 'contract.empty.none_registered_title')
  assert.equal(state.subtitle, 'contract.empty.none_registered_subtitle')
})

test('uses not-found keys when the search query filters the list', () => {
  const calls = []
  const state = resolveContractsListEmptyState({
    hasSearchQuery: true,
    translate: (...args) => {
      calls.push(args)
      return args.join('.')
    },
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_found_title'],
    ['contract', 'empty', 'none_found_subtitle'],
  ])
  assert.equal(state.title, 'contract.empty.none_found_title')
  assert.equal(state.subtitle, 'contract.empty.none_found_subtitle')
})

test('uses status-specific keys when a status filter is active', () => {
  const calls = []
  const state = resolveContractsListEmptyState({
    hasSearchQuery: true,
    hasStatusFilter: true,
    translate: (...args) => {
      calls.push(args)
      return args.join('.')
    },
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_in_status_title'],
    ['contract', 'empty', 'none_in_status_subtitle'],
  ])
  assert.equal(state.title, 'contract.empty.none_in_status_title')
  assert.equal(state.subtitle, 'contract.empty.none_in_status_subtitle')
})

test('reuses the client empty state copy for the customer contracts tab', () => {
  const calls = []
  const state = resolveClientContractsEmptyState((...args) => {
    calls.push(args)
    return args.join('.')
  })

  assert.deepEqual(calls, [
    ['contract', 'empty', 'none_registered_title'],
    ['contract', 'empty', 'none_registered_subtitle'],
  ])
  assert.equal(state.title, 'contract.empty.none_registered_title')
  assert.equal(state.subtitle, 'contract.empty.none_registered_subtitle')
})
