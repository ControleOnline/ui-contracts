/**
 * Builds user-facing feedback after the main contract save succeeds.
 * Follow-up steps (linked order, product inheritance) must not collapse
 * into a total failure when the contract is already persisted.
 */
function buildCreateContractFeedback({
  copiedProductsCount = 0,
  warningMessages = [],
  translate = key => key,
} = {}) {
  const normalizedWarnings = Array.isArray(warningMessages)
    ? warningMessages.filter(message => String(message || '').trim())
    : []

  const successMessage =
    copiedProductsCount > 0 && normalizedWarnings.length === 0
      ? translate('createdWithInheritedProducts', {
          copiedProductsCount,
        })
      : translate('createdSuccessfully')

  const warningMessage =
    normalizedWarnings.length > 0 ? normalizedWarnings.join('\n') : ''

  const infoMessage =
    normalizedWarnings.length === 0 && copiedProductsCount === 0
      ? translate('noInheritedProducts')
      : ''

  return {
    successMessage,
    warningMessage,
    infoMessage,
  }
}

module.exports = {
  buildCreateContractFeedback,
}
