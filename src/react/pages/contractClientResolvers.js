/**
 * Client name resolution helpers for contracts list (app-community#55).
 */

function createContractClientResolvers({
  currentCompany,
  peopleNameById,
  getPeopleDisplayName,
}) {
  const extractPeopleId = person => {
    if (!person) {
      return '';
    }

    if (typeof person === 'string' || typeof person === 'number') {
      return normalizeDigits(person);
    }

    return normalizeDigits(person?.['@id'] || person?.id || person?.people);
  };

  const resolvePeopleName = person => {
    if (!person || typeof person !== 'object') {
      return '';
    }

    return normalizeText(getPeopleDisplayName(person));
  };

  const getResolvedPeopleName = person => {
    const directName = resolvePeopleName(person);
    if (directName) {
      return directName;
    }

    const personId = extractPeopleId(person);
    return personId ? peopleNameById[personId] || '' : '';
  };

  const getResolvedPeopleType = person => {
    if (person && typeof person === 'object' && person?.peopleType) {
      return String(person.peopleType || '').trim().toUpperCase();
    }

    const personId = extractPeopleId(person);
    return personId
      ? String(peopleTypeById[personId] || '').trim().toUpperCase()
      : '';
  };

  const isLegalEntity = person => getResolvedPeopleType(person) === 'J';

  const getContractPartyCandidates = contract => {
    const participants = Array.isArray(contract?.peoples) ? contract.peoples : [];
    const participantsOrdered = [...participants].sort((left, right) => {
      const leftType = String(left?.peopleType || '').trim().toLowerCase();
      const rightType = String(right?.peopleType || '').trim().toLowerCase();

      const weight = type => {
        if (type === 'provider') return 0;
        if (type === 'contractor') return 1;
        if (type === 'witness') return 2;
        return 3;
      };

      return weight(leftType) - weight(rightType);
    });

    return [
      ...participantsOrdered.map(entry => entry?.people),
      contract?.client,
      contract?.customer,
      contract?.contractor,
      contract?.people,
      contract?.provider,
    ].filter(Boolean);
  };

  const isCurrentCompanyPerson = person => {
    const reference = String(
      typeof person === 'object' ? person?.['@id'] || person?.id : person || '',
    ).trim();
    const companyId = normalizeDigits(currentCompany?.id);
    if (!reference || !companyId) {
      return false;
    }

    const referenceDigits = extractPeopleId(reference);
    return (
      reference === `/people/${companyId}` ||
      reference === `/peoples/${companyId}` ||
      referenceDigits === companyId
    );
  };

  const isIgnoredContractPartyId = (contract, personId) => {
    if (!personId) {
      return true;
    }

    const companyId = normalizeDigits(currentCompany?.id);
    const modelPeopleId = normalizeDigits(contract?.contractModel?.people);
    const signerId = normalizeDigits(contract?.contractModel?.signer);

    return [companyId, modelPeopleId, signerId].some(
      referenceId => referenceId && referenceId === personId,
    );
  };

  const getContractClientName = contract => {
    const candidates = getContractPartyCandidates(contract);
    for (const candidate of candidates) {
      const personId = extractPeopleId(candidate);
      if (personId && isIgnoredContractPartyId(contract, personId)) {
        continue;
      }

      if (personId && isCurrentCompanyPerson(candidate)) {
        continue;
      }

      if (!isLegalEntity(candidate)) {
        continue;
      }

      const name = getResolvedPeopleName(candidate);
      if (name) {
        return name;
      }
    }

    return '';
  };

  const isContractClientPendingResolution = contract => {
    const candidates = getContractPartyCandidates(contract);
    return candidates.some(candidate => {
      const personId = extractPeopleId(candidate);
      if (!personId || isIgnoredContractPartyId(contract, personId)) {
        return false;
      }

      if (isCurrentCompanyPerson(candidate) || !isLegalEntity(candidate)) {
        return false;
      }

      const name = getResolvedPeopleName(candidate);
      return !name;
    });
  };

  return {
    extractPeopleId,
    getResolvedPeopleName,
    getResolvedPeopleType,
    getContractPartyCandidates,
    getContractClientName,
    isContractClientPendingResolution,
  };
}

module.exports = { createContractClientResolvers };
