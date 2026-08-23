/**
 * Formats a contract date for display.
 * Null/undefined/empty/whitespace/invalid values render as the canonical em dash.
 * Valid ISO/date strings use pt-BR locale (aligned with ContractDetails).
 *
 * Accepts: null, undefined, '', '   ', '0000-00-00', false, invalid strings,
 * already-Invalid Date instances, and valid Date/ISO values.
 */
function formatContractDate(value, locale = 'pt-BR') {
  if (value == null || value === false) {
    return '—';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      trimmed === '' ||
      trimmed === '0000-00-00' ||
      trimmed === '0000-00-00 00:00:00' ||
      /^invalid date$/i.test(trimmed)
    ) {
      return '—';
    }
    value = trimmed;
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
