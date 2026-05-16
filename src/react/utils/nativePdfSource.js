function normalizePdfContent(content = '') {
  return String(content || '').trim();
}

function isRemotePdfUrl(content = '') {
  return /^https?:\/\//i.test(normalizePdfContent(content));
}

function buildNativePdfSource(content) {
  const normalizedContent = normalizePdfContent(content);

  if (!normalizedContent) {
    return null;
  }

  if (normalizedContent.startsWith('data:application/pdf')) {
    return { uri: normalizedContent, cache: true };
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
