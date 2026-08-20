/**
 * Empty-state copy for contracts lists.
 * Prefer translated values; fall back to Portuguese when the translate layer
 * returns the humanized key (e.g. "None registered title") because the key
 * is not yet registered for the company/language.
 */

const PT_FALLBACKS = {
  none_registered_title: 'Nenhum contrato cadastrado',
  none_registered_subtitle: 'Cadastre o primeiro contrato para este cliente.',
  none_found_title: 'Nenhum contrato encontrado',
  none_found_subtitle: 'Tente ajustar a busca ou limpar os filtros.',
  none_in_status_title: 'Nenhum contrato neste status',
  none_in_status_subtitle: 'Altere o filtro de status para ver outros contratos.',
};

function looksUnresolved(value, key) {
  if (value == null) return true;
  const text = String(value).trim();
  if (!text) return true;
  const humanized = String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
  if (text === humanized) return true;
  if (text.toLowerCase() === String(key || '').toLowerCase()) return true;
  if (text.includes(`contract.empty.${key}`)) return true;
  if (/^none registered/i.test(text)) return true;
  return false;
}

function resolveMessage(translate, key) {
  const translated = translate?.('contract', 'empty', key);
  if (looksUnresolved(translated, key)) {
    return PT_FALLBACKS[key] || translated || key;
  }
  return translated;
}

function resolveContractsListEmptyState({
  hasSearchQuery = false,
  hasStatusFilter = false,
  translate,
} = {}) {
  if (hasStatusFilter) {
    return {
      title: resolveMessage(translate, 'none_in_status_title'),
      subtitle: resolveMessage(translate, 'none_in_status_subtitle'),
    };
  }

  if (hasSearchQuery) {
    return {
      title: resolveMessage(translate, 'none_found_title'),
      subtitle: resolveMessage(translate, 'none_found_subtitle'),
    };
  }

  return resolveClientContractsEmptyState(translate);
}

function resolveClientContractsEmptyState(translate) {
  return {
    title: resolveMessage(translate, 'none_registered_title'),
    subtitle: resolveMessage(translate, 'none_registered_subtitle'),
  };
}

module.exports = {
  resolveClientContractsEmptyState,
  resolveContractsListEmptyState,
  // exported for unit tests
  looksUnresolved,
  resolveMessage,
  PT_FALLBACKS,
};
