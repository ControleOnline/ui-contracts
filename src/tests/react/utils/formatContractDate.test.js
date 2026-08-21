const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { formatContractDate } = require('../../../react/utils/formatContractDate');

describe('formatContractDate', () => {
  it('returns em dash for null', () => {
    assert.equal(formatContractDate(null), '—');
  });

  it('returns em dash for undefined', () => {
    assert.equal(formatContractDate(undefined), '—');
  });

  it('returns em dash for empty string', () => {
    assert.equal(formatContractDate(''), '—');
  });

  it('returns em dash for invalid date string', () => {
    assert.equal(formatContractDate('not-a-date'), '—');
  });

  it('formats a valid ISO date in pt-BR', () => {
    const result = formatContractDate('2026-02-23');
    assert.match(result, /23[/.-]0?2[/.-]2026/);
  });

  it('formats a valid Date instance', () => {
    const result = formatContractDate(new Date(2026, 1, 23));
    assert.match(result, /23[/.-]0?2[/.-]2026/);
  });

  it('does not throw when endDate is missing (regression for Invalid Date)', () => {
    assert.doesNotThrow(() => formatContractDate(null));
    assert.notEqual(formatContractDate(null), 'Invalid Date');
  });
});
