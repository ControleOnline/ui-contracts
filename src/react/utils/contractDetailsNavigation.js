function resolveContractDetailsBackAction(navigation = {}) {
  if (typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
    return {
      type: 'history',
    }
  }

  return {
    type: 'route',
    routeName: 'ContractsIndex',
  }
}

module.exports = {
  resolveContractDetailsBackAction,
}
