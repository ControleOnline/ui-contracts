function resolveContractsListEmptyState({
  hasSearchQuery = false,
  hasStatusFilter = false,
  translate,
} = {}) {
  if (hasStatusFilter) {
    return {
      title: translate?.('contract', 'empty', 'none_in_status_title'),
      subtitle: translate?.('contract', 'empty', 'none_in_status_subtitle'),
    }
  }

  if (hasSearchQuery) {
    return {
      title: translate?.('contract', 'empty', 'none_found_title'),
      subtitle: translate?.('contract', 'empty', 'none_found_subtitle'),
    }
  }

  return resolveClientContractsEmptyState(translate)
}

function resolveClientContractsEmptyState(translate) {
  return {
    title: translate?.('contract', 'empty', 'none_registered_title'),
    subtitle: translate?.('contract', 'empty', 'none_registered_subtitle'),
  }
}

module.exports = {
  resolveClientContractsEmptyState,
  resolveContractsListEmptyState,
}
