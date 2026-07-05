import {StyleSheet} from 'react-native';

export const createStyles = palette =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.pageBackground,
    },
    header: {
      backgroundColor: palette.headerBackground,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.headerBorder,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.headerText,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: palette.textMuted,
    },
    scrollView: {
      flex: 1,
      paddingTop: 16,
    },
    contractCard: {
      backgroundColor: palette.cardBackground,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      elevation: 2,
      shadowColor: palette.cardShadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    contractHeader: {
      padding: 16,
      backgroundColor: palette.cardHeaderBackground,
      borderBottomWidth: 1,
      borderBottomColor: palette.dividerBorder,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    contractTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.cardHeaderText,
      flex: 1,
      marginRight: 12,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.badgeText,
      textTransform: 'uppercase',
    },
    contractBody: {
      padding: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 14,
      color: palette.textMuted,
      marginLeft: 8,
      marginRight: 8,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: palette.cardText,
      flex: 1,
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dateItem: {
      flex: 1,
      alignItems: 'center',
      padding: 12,
      backgroundColor: palette.sectionBackground,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    dateLabel: {
      fontSize: 12,
      color: palette.textMuted,
      marginTop: 4,
      marginBottom: 2,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.cardText,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.buttonBackground,
      margin: 16,
      marginTop: 0,
      paddingVertical: 12,
      borderRadius: 8,
    },
    viewButtonText: {
      color: palette.buttonText,
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    loadingText: {
      fontSize: 16,
      color: palette.loadingText,
      marginTop: 12,
    },
    errorText: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.cardText,
      marginTop: 16,
      textAlign: 'center',
    },
    errorDetail: {
      fontSize: 14,
      color: palette.textMuted,
      marginTop: 8,
      textAlign: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.cardText,
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: palette.textMuted,
      marginTop: 8,
      textAlign: 'center',
    },
    bottomPadding: {
      height: 20,
    },
  });
