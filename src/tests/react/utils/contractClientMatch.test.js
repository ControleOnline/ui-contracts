const assert = require('node:assert/strict')
const test = require('node:test')

const {
  buildClientContractsParams,
  contractMatchesClient,
  contractMatchesParticipant,
  filterContractsByClient,
} = require('../../../react/utils/contractClientMatch')

test('builds client contracts params with the contract client relation', () => {
  assert.deepEqual(
    buildClientContractsParams({
      currentCompanyId: '7',
      clientId: '11',
    }),
    {
      provider: '7',
      client: '/people/11',
      'contractModel.context': 'contract',
    },
  )
})

test('builds contact contracts params with the signer relation only', () => {
  assert.deepEqual(
    buildClientContractsParams({
      currentCompanyId: '7',
      clientId: '15',
      parentCompanyIri: '/people/11',
    }),
    {
      provider: '7',
      'contractModel.context': 'contract',
      'peoples.people': '/people/15',
    },
  )
})

test('matches the contract by its direct client relation', () => {
  assert.equal(
    contractMatchesClient(
      {
        client: '/people/11',
        peoples: [
          {
            people: '/people/99',
          },
        ],
      },
      {
        clientId: '11',
        clientIri: '/people/11',
      },
    ),
    true,
  )
})

test('falls back to contract people only when the direct client is absent', () => {
  assert.equal(
    contractMatchesClient(
      {
        peoples: [
          {
            people: {
              '@id': '/people/11',
            },
          },
        ],
      },
      {
        clientId: '11',
        clientIri: '/people/11',
      },
    ),
    true,
  )
})

test('matches the contract by its participant relation', () => {
  assert.equal(
    contractMatchesParticipant(
      {
        peoples: [
          {
            people: {
              '@id': '/people/15',
            },
          },
        ],
      },
      {
        participantId: '15',
        participantIri: '/people/15',
      },
    ),
    true,
  )
})

test('filters contracts by the linked client relation', () => {
  assert.deepEqual(
    filterContractsByClient(
      [
        {
          id: 23,
          client: '/people/11',
        },
        {
          id: 24,
          client: '/people/12',
        },
      ],
      {
        clientId: '11',
        clientIri: '/people/11',
      },
    ).map(contract => contract.id),
    [23],
  )
})

test('keeps the original list when the payload has no inspectable client data', () => {
  const contracts = [
    {
      id: 23,
    },
  ]

  assert.deepEqual(
    filterContractsByClient(contracts, {
      clientId: '11',
      clientIri: '/people/11',
    }),
    contracts,
  )
})

test('filters contracts by signer in the contact details flow even across different clients', () => {
  assert.deepEqual(
    filterContractsByClient(
      [
        {
          id: 45,
          client: '/people/11',
          peoples: [
            {
              people: '/people/15',
            },
          ],
        },
        {
          id: 46,
          client: '/people/11',
          peoples: [
            {
              people: '/people/18',
            },
          ],
        },
        {
          id: 47,
          client: '/people/19',
          peoples: [
            {
              people: '/people/15',
            },
          ],
        },
      ],
      {
        clientId: '15',
        clientIri: '/people/15',
        parentCompanyIri: '/people/11',
      },
    ).map(contract => contract.id),
    [45, 47],
  )
})
