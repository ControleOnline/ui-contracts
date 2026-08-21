/**
 * Formats a contract date for display.
 * Null/undefined/empty/invalid values render as the canonical em dash fallback.
 * Valid ISO/date strings use pt-BR locale (aligned with ContractDetails).
 */
function formatContractDate(value, locale = 'pt-BR') {
  if (value == null || value === '') {
    return '—';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString(locale);
}

module.exports = {
  formatContractDate,
};
