/**
 * Pure helpers for contract status labels, filters and matching.
 * Color resolution stays theme-aware in contractsTheme.getContractsStatusColor.
 */

function normalizeContractStatusKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

const STATUS_TRANSLATION_KEYS = {
  open: 'open',
  aberto: 'open',
  pending: 'pending',
  pendente: 'pending',
  closed: 'closed',
  fechado: 'closed',
  active: 'active',
  ativo: 'active',
  inactive: 'inactive',
  inativo: 'inactive',
  signed: 'signed',
  assinado: 'signed',
  canceled: 'canceled',
  cancelado: 'canceled',
};

function getContractStatusTranslationKey(status) {
  const normalized = normalizeContractStatusKey(status);
  return STATUS_TRANSLATION_KEYS[normalized] || '';
}

/**
 * Resolve the display label for a contract status via i18n.
 * @param {string} status
 * @param {Function} [translate] - (store, type, key) => string
 * @returns {string}
 */
function getContractStatusLabel(status, translate) {
  const translationKey = getContractStatusTranslationKey(status);
  if (translationKey) {
    return translate?.('contract', 'status', translationKey) || translationKey;
  }

  if (status) {
    return String(status);
  }

  return translate?.('contract', 'label', 'na') || '';
}

/**
 * Public filter chips for realStatus (open / pending / closed).
 * @param {Function} [translate]
 * @param {Function} [resolveColor] - optional (statusKey) => color
 */
function getContractStatusFilterOptions(translate, resolveColor) {
  const colorFor = key => (typeof resolveColor === 'function' ? resolveColor(key) : undefined);

  return [
    {
      key: 'realStatus:open',
      label: translate?.('contract', 'status', 'open') || 'Em aberto',
      color: colorFor('open'),
      normalizedStatus: 'open',
    },
    {
      key: 'realStatus:pending',
      label: translate?.('contract', 'status', 'pending') || 'Pendente',
      color: colorFor('pending'),
      normalizedStatus: 'pending',
    },
    {
      key: 'realStatus:closed',
      label: translate?.('contract', 'status', 'closed') || 'Fechado',
      color: colorFor('closed'),
      normalizedStatus: 'closed',
    },
  ];
}

/**
 * Client-side match against selected realStatus filter key.
 */
function contractMatchesStatusFilter(contract, filterKey) {
  if (!filterKey) {
    return true;
  }

  const normalizedStatus = normalizeContractStatusKey(
    contract?.status?.realStatus || contract?.status?.status,
  );
  const normalizedFilter = normalizeContractStatusKey(
    String(filterKey || '').replace('realStatus:', ''),
  );

  return normalizedStatus === normalizedFilter;
}

module.exports = {
  normalizeContractStatusKey,
  getContractStatusTranslationKey,
  getContractStatusLabel,
  getContractStatusFilterOptions,
  contractMatchesStatusFilter,
};
