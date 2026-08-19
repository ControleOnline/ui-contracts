/**
 * Helpers for building a react-native-pdf source from API file content.
 * Content is expected as pure base64 (no data: prefix) or a data:application/pdf URI.
 * Remote http(s) URLs are rejected for native inline rendering (open externally if needed).
 */

function normalizePdfContent(content = '') {
  return String(content || '').trim();
}

function isRemotePdfUrl(content = '') {
  return /^https?:\/\//i.test(normalizePdfContent(content));
}

/**
 * @param {string} content - base64 body or data:application/pdf;base64,... URI
 * @returns {{ uri: string, cache: boolean } | null}
 */
function buildNativePdfSource(content) {
  const normalizedContent = normalizePdfContent(content);

  if (!normalizedContent) {
    return null;
  }

  if (normalizedContent.startsWith('data:application/pdf')) {
    return {uri: normalizedContent, cache: true};
  }

  if (isRemotePdfUrl(normalizedContent)) {
    return null;
  }

  return {
    uri: `data:application/pdf;base64,${normalizedContent}`,
    cache: true,
  };
}

module.exports = {
  buildNativePdfSource,
  isRemotePdfUrl,
  normalizePdfContent,
};
