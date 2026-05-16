const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildNativePdfSource,
  isRemotePdfUrl,
  normalizePdfContent,
} = require('../../../react/utils/nativePdfSource');

test('normalizes empty pdf payloads', () => {
  assert.equal(normalizePdfContent('   '), '');
  assert.equal(buildNativePdfSource('   '), null);
});

test('keeps data uri payloads untouched', () => {
  const source = buildNativePdfSource('data:application/pdf;base64,JVBERi0xLjQK');

  assert.deepEqual(source, {
    uri: 'data:application/pdf;base64,JVBERi0xLjQK',
    cache: true,
  });
});

test('rejects arbitrary remote pdf urls', () => {
  assert.equal(isRemotePdfUrl('https://example.com/contract.pdf'), true);
  assert.equal(buildNativePdfSource('https://example.com/contract.pdf'), null);
});

test('wraps raw base64 payloads in a data uri', () => {
  const source = buildNativePdfSource('  JVBERi0xLjQK  ');

  assert.deepEqual(source, {
    uri: 'data:application/pdf;base64,JVBERi0xLjQK',
    cache: true,
  });
});
