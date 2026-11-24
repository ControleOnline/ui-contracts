const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildContractSubtitle,
  formatContractPeriod,
} = require('../../../react/utils/contractHeader');

test('period keeps the API calendar date', () => {
  assert.equal(
    formatContractPeriod('2026-12-01T00:00:00-05:00', '2027-11-30T00:00:00-05:00'),
    '01/12/2026 → 30/11/2027',
  );
  assert.equal(formatContractPeriod('2026-12-01', null), 'Início 01/12/2026');
  assert.equal(formatContractPeriod(null, '2027-11-30'), 'Até 30/11/2027');
  assert.equal(formatContractPeriod(null, null), '');
});

test('subtitle joins id and period on one line', () => {
  assert.equal(
    buildContractSubtitle({ id: 27, startDate: '2026-12-01', endDate: '2026-12-31' }),
    '#27 · 01/12/2026 → 31/12/2026',
  );
  assert.equal(buildContractSubtitle({ id: 5 }), '#5');
  assert.equal(buildContractSubtitle(null), '');
});
