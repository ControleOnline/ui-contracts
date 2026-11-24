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

const toIsoDay = value => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
};

const formatContractPeriod = (startDate, endDate) => {
  const start = formatContractDate(startDate);
  // Legacy contracts store the creation date as end date; an end before the
  // start is not a real term, so only the start is shown.
  const startDay = toIsoDay(startDate);
  const endDay = toIsoDay(endDate);
  const end = startDay && endDay && endDay < startDay ? null : formatContractDate(endDate);

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

const CONTRACT_STATUS_LABELS = {
  open: 'Aberto',
  pending: 'Pendente',
  'waiting signature': 'Aguardando assinatura',
  signed: 'Assinado',
  active: 'Vigente',
  closed: 'Fechado',
  canceled: 'Cancelado',
  cancelled: 'Cancelado',
  draft: 'Rascunho',
};

// Translation keys may come back untranslated ("Open"); fall back to Portuguese.
const formatContractStatusLabel = (status, translated) => {
  const raw = String(status?.status || status?.realStatus || status || '').trim();
  const fallback = CONTRACT_STATUS_LABELS[raw.toLowerCase()];
  const candidate = String(translated || '').trim();
  if (candidate && candidate.toLowerCase() !== raw.toLowerCase()) {
    return candidate;
  }
  return fallback || candidate || raw || '—';
};

// Missing translations come back as the humanized key ("noSignatories" ->
// "No Signatories"); in that case use the Portuguese fallback.
const humanizeKey = key =>
  String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();

const translatedOr = (translated, key, fallback) => {
  const value = String(translated || '').trim();
  if (!value || value.toLowerCase() === humanizeKey(key) || value === key) {
    return fallback;
  }
  return value;
};

module.exports = {
  translatedOr,
  buildContractSubtitle,
  formatContractPeriod,
  formatContractStatusLabel,
};
