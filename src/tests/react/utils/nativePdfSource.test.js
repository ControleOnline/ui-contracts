const {describe, it} = require('node:test');
const assert = require('node:assert/strict');
const {
  buildNativePdfSource,
  isRemotePdfUrl,
  normalizePdfContent,
} = require('../../../react/utils/nativePdfSource');

describe('nativePdfSource', () => {
  it('normalizePdfContent trims and coerces nullish to empty string', () => {
    assert.equal(normalizePdfContent(null), '');
    assert.equal(normalizePdfContent(undefined), '');
    assert.equal(normalizePdfContent('  abc  '), 'abc');
  });

  it('isRemotePdfUrl detects http(s) only', () => {
    assert.equal(isRemotePdfUrl('https://example.com/file.pdf'), true);
    assert.equal(isRemotePdfUrl('http://example.com/file.pdf'), true);
    assert.equal(isRemotePdfUrl('JVBERi0xLjQK'), false);
    assert.equal(isRemotePdfUrl('data:application/pdf;base64,JVBERi0='), false);
    assert.equal(isRemotePdfUrl(''), false);
  });

  it('buildNativePdfSource returns null for empty content', () => {
    assert.equal(buildNativePdfSource(''), null);
    assert.equal(buildNativePdfSource('   '), null);
    assert.equal(buildNativePdfSource(null), null);
  });

  it('buildNativePdfSource returns null for remote http(s) URLs', () => {
    assert.equal(buildNativePdfSource('https://cdn.example.com/doc.pdf'), null);
  });

  it('buildNativePdfSource keeps data:application/pdf URI as-is', () => {
    const uri = 'data:application/pdf;base64,JVBERi0xLjQ=';
    assert.deepEqual(buildNativePdfSource(uri), {uri, cache: true});
  });

  it('buildNativePdfSource wraps pure base64 in data: URI', () => {
    const base64 = 'JVBERi0xLjQKJeLjz9MK';
    assert.deepEqual(buildNativePdfSource(base64), {
      uri: `data:application/pdf;base64,${base64}`,
      cache: true,
    });
  });
});
