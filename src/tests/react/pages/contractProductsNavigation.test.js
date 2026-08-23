const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  buildContractProductsParams,
  buildContractDetailsParams,
  getContractInitialTabIndex,
} = require('../../../react/pages/contractNavigation');

const cardSource = fs.readFileSync(
  path.resolve(__dirname, '../../../react/pages/ContractCard.js'),
  'utf8',
);
const detailsSource = fs.readFileSync(
  path.resolve(__dirname, '../../../react/pages/ContractDetails.js'),
  'utf8',
);
const pageSource = fs.readFileSync(
  path.resolve(__dirname, '../../../react/pages/ContractsPage.js'),
  'utf8',
);

test('buildContractProductsParams includes initialTab products', () => {
  assert.deepEqual(buildContractProductsParams(9), {
    contractId: 9,
    initialTab: 'products',
  });
});

test('buildContractDetailsParams omits initialTab by default', () => {
  assert.deepEqual(buildContractDetailsParams(3), { contractId: 3 });
});

test('getContractInitialTabIndex maps products to tab 1', () => {
  assert.equal(getContractInitialTabIndex('products'), 1);
  assert.equal(getContractInitialTabIndex(''), 0);
});

test('contract card products shortcut uses buildContractProductsParams', () => {
  const compact = cardSource.replace(/\s+/g, ' ');
  assert.match(compact, /buildContractProductsParams\(contract\.id\)/);
  assert.match(compact, /navigation\.navigate\(\s*'ContractDetails'/);
});

test('contract details honors initialTab via getContractInitialTabIndex', () => {
  assert.match(detailsSource.replace(/\s+/g, ' '), /getContractInitialTabIndex\(initialTab\)/);
  assert.match(detailsSource.replace(/\s+/g, ' '), /getContractInitialTabIndex\(initialTab\)/);
});

test('contracts page wires ContractCard', () => {
  assert.match(pageSource, /<ContractCard/);
});
