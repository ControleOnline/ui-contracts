/**
 * Navigation helpers for contract details (app-community#55).
 */

function buildContractDetailsParams(contractId, options = {}) {
  const params = { contractId };
  if (options.initialTab) {
    params.initialTab = options.initialTab;
  }
  return params;
}

function buildContractProductsParams(contractId) {
  return buildContractDetailsParams(contractId, { initialTab: 'products' });
}

function getContractInitialTabIndex(initialTab) {
  return String(initialTab || '').trim().toLowerCase() === 'products' ? 1 : 0;
}

module.exports = {
  buildContractDetailsParams,
  buildContractProductsParams,
  getContractInitialTabIndex,
};
