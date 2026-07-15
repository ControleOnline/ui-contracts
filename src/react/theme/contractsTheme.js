export const buildContractsPalette = themeColors => ({
  badgeText: themeColors.badgeText,
  buttonBackground: themeColors.buttonBackground,
  buttonBackgroundSecondary: themeColors.buttonBackgroundSecondary,
  buttonBorder: themeColors.buttonBorder,
  buttonBorderSecondary: themeColors.buttonBorderSecondary,
  buttonDisabledBackground: themeColors.buttonDisabledBackground,
  buttonDisabledText: themeColors.buttonDisabledText,
  buttonIcon: themeColors.buttonIcon,
  buttonShadow: themeColors.buttonShadow,
  buttonText: themeColors.buttonText,
  buttonTextSecondary: themeColors.buttonTextSecondary,
  cardBackground: themeColors.cardBackground,
  cardBorder: themeColors.cardBorder,
  cardHeaderBackground: themeColors.cardHeaderBackground,
  cardHeaderText: themeColors.cardHeaderText,
  cardShadow: themeColors.cardShadow,
  cardText: themeColors.cardText,
  chipBackground: themeColors.chipBackground,
  chipBorder: themeColors.chipBorder,
  chipSelectedBackground: themeColors.chipSelectedBackground,
  chipSelectedBorder: themeColors.chipSelectedBorder,
  chipSelectedText: themeColors.chipSelectedText,
  chipText: themeColors.chipText,
  dividerBorder: themeColors.dividerBorder,
  headerBackground: themeColors.headerBackground,
  headerBorder: themeColors.headerBorder,
  headerText: themeColors.headerText,
  iconDanger: themeColors.iconDanger,
  iconDisabled: themeColors.iconDisabled,
  iconInfo: themeColors.iconInfo,
  iconMuted: themeColors.iconMuted,
  iconSuccess: themeColors.iconSuccess,
  inputBackground: themeColors.inputBackground,
  inputBorder: themeColors.inputBorder,
  inputIcon: themeColors.inputIcon,
  inputPlaceholderText: themeColors.inputPlaceholderText,
  inputText: themeColors.inputText,
  listItemBackground: themeColors.listItemBackground,
  listItemBorder: themeColors.listItemBorder,
  listItemIcon: themeColors.listItemIcon,
  listItemSelectedBackground: themeColors.listItemSelectedBackground,
  listItemSelectedBorder: themeColors.listItemSelectedBorder,
  listItemSubtitleText: themeColors.listItemSubtitleText,
  listItemText: themeColors.listItemText,
  loadingBackground: themeColors.loadingBackground,
  loadingBorder: themeColors.loadingBorder,
  loadingSpinner: themeColors.loadingSpinner,
  loadingText: themeColors.loadingText,
  modalBackground: themeColors.modalBackground,
  modalBorder: themeColors.modalBorder,
  modalCloseIcon: themeColors.modalCloseIcon,
  modalHeaderText: themeColors.modalHeaderText,
  modalOverlay: themeColors.modalOverlay,
  modalShadow: themeColors.modalShadow,
  modalText: themeColors.modalText,
  navigationActiveBackground: themeColors.navigationActiveBackground,
  navigationActiveBorder: themeColors.navigationActiveBorder,
  navigationActiveIcon: themeColors.navigationActiveIcon,
  navigationActiveText: themeColors.navigationActiveText,
  navigationBackground: themeColors.navigationBackground,
  navigationBorder: themeColors.navigationBorder,
  navigationText: themeColors.navigationText,
  pageBackground: themeColors.pageBackground,
  sectionBackground: themeColors.sectionBackground,
  sectionBorder: themeColors.sectionBorder,
  selectBackground: themeColors.selectBackground,
  selectBorder: themeColors.selectBorder,
  selectIcon: themeColors.selectIcon,
  selectOptionBackground: themeColors.selectOptionBackground,
  selectOptionBorder: themeColors.selectOptionBorder,
  selectOptionSelectedBackground: themeColors.selectOptionSelectedBackground,
  selectOptionSelectedText: themeColors.selectOptionSelectedText,
  selectPlaceholderText: themeColors.selectPlaceholderText,
  selectText: themeColors.selectText,
  shadow: themeColors.shadow,
  sheetBackground: themeColors.sheetBackground,
  surface: themeColors.surface,
  textDanger: themeColors.textDanger,
  textDisabled: themeColors.textDisabled,
  textMuted: themeColors.textMuted,
  textPrimary: themeColors.textPrimary,
  textSecondary: themeColors.textSecondary,
  error: themeColors.error,
  info: themeColors.info,
  success: themeColors.success,
  warning: themeColors.warning,
});

export const normalizeContractsStatusKey = value =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

export const getContractsStatusColor = (palette, status) => {
  switch (normalizeContractsStatusKey(status)) {
    case 'open':
    case 'aberto':
      return palette.info;
    case 'ativo':
    case 'active':
    case 'assinado':
    case 'signed':
      return palette.success;
    case 'inativo':
    case 'inactive':
    case 'cancelado':
    case 'canceled':
      return palette.error;
    case 'pendente':
    case 'pending':
      return palette.warning;
    case 'closed':
    case 'fechado':
    default:
      return palette.textMuted;
  }
};
