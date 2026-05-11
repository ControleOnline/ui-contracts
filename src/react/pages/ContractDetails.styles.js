import { Platform, StyleSheet } from 'react-native';
import { colors } from '@controleonline/../../src/styles/colors';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    marginRight: 12,
  },
  topAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  topSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  fixedInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusBox: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginHorizontal: 6,
  },
  dateLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  dateValue: { fontSize: 16, fontWeight: '700', color: '#0f172a' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabItem: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: colors.primary },
  tabLabel: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },

  tabScroll: { flex: 1 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },

  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 15
  },
  emptyText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 15
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    padding: 24
  },

  htmlWrapper: { backgroundColor: '#fff' },

  fixedSignButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 12 },

  subscriberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subscriberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subscriberName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  subscriberRole: { fontSize: 13, color: '#64748b' },

  addForm: {
    marginTop: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  label: { fontSize: 14, color: '#64748b', marginBottom: 8, fontWeight: '500' },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleBtnActive: { backgroundColor: '#e0f2fe', borderColor: colors.primary },
  roleText: { fontWeight: '600', color: '#64748b' },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonDisabled: { backgroundColor: '#cbd5e1' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  modalContent: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 19, fontWeight: '700' },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  personRowSelected: { backgroundColor: '#f0f9ff' },
  personName: { fontSize: 16, color: '#0f172a', flex: 1 },

  topSkeleton: { height: 100, backgroundColor: '#e2e8f0', margin: 16, borderRadius: 12 },
  infoSkeleton: { height: 140, backgroundColor: '#e2e8f0', marginHorizontal: 16, marginBottom: 8, borderRadius: 12 },
  tabsSkeleton: { height: 56, backgroundColor: '#e2e8f0', marginHorizontal: 16, borderRadius: 12 },
});

export default styles;

export const inlineStyle_61_12 = (
  {
    height: height,
  },
) => ({
  alignItems: 'center',
  justifyContent: 'center',
  height: height * 0.75,
  padding: 30,
});

export const inlineStyle_63_14 = {
  color: 'red',
  fontSize: 16,
  textAlign: 'center',
  marginTop: 16,
  lineHeight: 24,
};

export const inlineStyle_72_12 = (
  {
    height: height,
  },
) => ({
  alignItems: 'center',
  justifyContent: 'center',
  height: height * 0.75,
});

export const inlineStyle_74_14 = {
  marginTop: 16,
  color: '#64748b',
  fontSize: 15,
};

export const inlineStyle_82_10 = (
  {
    height: height,
  },
) => ({
  height: height * 0.75,
  width: '100%',
});

export const inlineStyle_86_8 = {
  width: '100%',
  height: '100%',
  border: 'none',
};

export const inlineStyle_101_10 = {
  flex: 1,
};

export const inlineStyle_184_20 = {
  flex: 1,
};

export const inlineStyle_202_75 = {
  marginRight: 12,
};

export const inlineStyle_203_20 = (
  {
    selectedPerson: selectedPerson,
  },
) => ({
  flex: 1,
  color: selectedPerson ? '#0f172a' : '#94a3b8',
});

export const inlineStyle_211_18 = {
  marginVertical: 12,
};

export const inlineStyle_395_14 = {
  flex: 1,
};

export const inlineStyle_464_14 = (
  {
    width: width,
  },
) => ({
  width,
  flex: 1,
});

export const inlineStyle_475_14 = (
  {
    width: width,
  },
) => ({
  width,
  flex: 1,
});

export const inlineStyle_485_14 = (
  {
    width: width,
  },
) => ({
  width,
  flex: 1,
});

export const inlineStyle_128_8 = (
  {
    canEdit: canEdit,
  },
) => ({
  padding: 16,
  paddingBottom: canEdit ? 120 : 40,
});

export const inlineStyle_149_18 = {
  color: '#334155',
  lineHeight: 24,
};

export const inlineStyle_192_41 = {
  padding: 16,
  paddingBottom: 100,
};
