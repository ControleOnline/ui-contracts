function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function buildPeopleIri(clientId) {
  return clientId ? `/people/${clientId}` : ''
}

function getEntityIdentifiers(entity) {
  const identifiers = []

  if (typeof entity === 'string' || typeof entity === 'number') {
    const rawValue = String(entity)
    identifiers.push(rawValue)

    const digits = normalizeDigits(rawValue)
    if (digits) {
      identifiers.push(digits)
      identifiers.push(buildPeopleIri(digits))
      identifiers.push(`/peoples/${digits}`)
    }
  } else if (entity && typeof entity === 'object') {
    if (entity['@id']) {
      identifiers.push(String(entity['@id']))
    }

    if (entity.id != null) {
      identifiers.push(String(entity.id))
    }
  }

  return [...new Set(identifiers.filter(Boolean))]
}

function getEntryIdentifiers(entry) {
  const identifiers = getEntityIdentifiers(entry?.people)

  if (entry?.peopleId != null) {
    identifiers.push(String(entry.peopleId))
  }

  return [...new Set(identifiers.filter(Boolean))]
}

function matchesClientIdentifier(identifier, clientId, clientIri) {
  if (!identifier) {
    return false
  }

  const normalizedClientIri = clientIri || buildPeopleIri(clientId)
  const normalizedIdentifier = String(identifier)

  return (
    normalizedIdentifier === normalizedClientIri ||
    normalizedIdentifier === `/peoples/${clientId}` ||
    normalizeDigits(normalizedIdentifier) === clientId
  )
}

function contractHasInspectableClient(contract) {
  if (getEntityIdentifiers(contract?.client).length > 0) {
    return true
  }

  return Array.isArray(contract?.peoples)
    ? contract.peoples.some(entry => getEntryIdentifiers(entry).length > 0)
    : false
}

function contractMatchesClient(contract, {clientId = '', clientIri = ''} = {}) {
  if (!clientId) {
    return true
  }

  const directClientIdentifiers = getEntityIdentifiers(contract?.client)
  if (directClientIdentifiers.length > 0) {
    return directClientIdentifiers.some(identifier =>
      matchesClientIdentifier(identifier, clientId, clientIri),
    )
  }

  return Array.isArray(contract?.peoples)
    ? contract.peoples.some(entry =>
        getEntryIdentifiers(entry).some(identifier =>
          matchesClientIdentifier(identifier, clientId, clientIri),
        ),
      )
    : false
}

function filterContractsByClient(contracts, {clientId = '', clientIri = ''} = {}) {
  const safeContracts = Array.isArray(contracts) ? contracts : []

  if (!clientId) {
    return safeContracts
  }

  if (!safeContracts.some(contractHasInspectableClient)) {
    return safeContracts
  }

  return safeContracts.filter(contract =>
    contractMatchesClient(contract, {clientId, clientIri}),
  )
}

function buildClientContractsParams({
  currentCompanyId = '',
  clientId = '',
  clientIri = '',
} = {}) {
  const normalizedClientId = normalizeDigits(clientId)
  const normalizedClientIri = clientIri || buildPeopleIri(normalizedClientId)

  return {
    provider: currentCompanyId,
    client: normalizedClientIri,
    'contractModel.context': 'contract',
  }
}

module.exports = {
  buildClientContractsParams,
  contractMatchesClient,
  filterContractsByClient,
}
