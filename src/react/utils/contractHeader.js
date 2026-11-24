// Compact header for contract details: one line, so the draft gets the screen.

const formatContractDate = value => {
  if (!value) {
    return null;
  }

  // Use the calendar date sent by the API; `new Date()` would shift it by timezone.
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('pt-BR');
};

const formatContractPeriod = (startDate, endDate) => {
  const start = formatContractDate(startDate);
  const end = formatContractDate(endDate);

  if (start && end) {
    return `${start} → ${end}`;
  }
  if (start) {
    return `Início ${start}`;
  }
  if (end) {
    return `Até ${end}`;
  }
  return '';
};

const buildContractSubtitle = contract => {
  const period = formatContractPeriod(contract?.startDate, contract?.endDate);
  const id = contract?.id ? `#${contract.id}` : '';
  return [id, period].filter(Boolean).join(' · ');
};

module.exports = {
  buildContractSubtitle,
  formatContractPeriod,
};
