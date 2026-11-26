const assert = require('node:assert/strict')
const {test} = require('node:test')

const {
  resolveContractDetailsBackAction,
} = require('../../../react/utils/contractDetailsNavigation')

test('uses browser/app history when navigation can go back', () => {
  assert.deepEqual(
    resolveContractDetailsBackAction({
      canGoBack: () => true,
    }),
    {
      type: 'history',
    },
  )
})

test('falls back to ContractsIndex when there is no back stack', () => {
  assert.deepEqual(
    resolveContractDetailsBackAction({
      canGoBack: () => false,
    }),
    {
      type: 'route',
      routeName: 'ContractsIndex',
    },
  )
})

test('falls back to ContractsIndex when canGoBack is absent', () => {
  assert.deepEqual(
    resolveContractDetailsBackAction({}),
    {
      type: 'route',
      routeName: 'ContractsIndex',
    },
  )
})
