import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStores} from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';
import {createStyles} from './contracts.styles';
import {
  buildContractsPalette,
  getContractsStatusColor,
} from '../theme/contractsTheme';
const {resolveClientContractsEmptyState} = require('../utils/contractEmptyState');
const {
  buildClientContractsParams,
  filterContractsByClient,
} = require('../utils/contractClientMatch');

const Contracts = ({client, parentCompanyIri = ''}) => {
  const themeStore = useStores(state => state.theme);
  const themeColors = themeStore.getters.colors;
  const palette = useMemo(() => buildContractsPalette(themeColors), [themeColors]);
  const contractStyles = useMemo(() => createStyles(palette), [palette]);
  const peopleStore = useStores(state => state.people);
  const peopleGetters = peopleStore.getters;
  const {currentCompany} = peopleGetters;
  const contractStore = useStores(state => state.contract);
  const contractGetters = contractStore.getters;
  const contractActions = contractStore.actions;
  const {items: contracts, isLoading, error} = contractGetters;
  const navigation = useNavigation();
  const emptyState = resolveClientContractsEmptyState(global.t?.t);
  const clientId = String(
    client?.id || client?.['@id']?.toString().replace(/\D/g, '') || '',
  );
  const clientIri = client?.['@id'] || (clientId ? `/people/${clientId}` : '');

  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const contractsByClient = useMemo(
    () =>
      filterContractsByClient(safeContracts, {
        clientId,
        clientIri,
        parentCompanyIri,
      }),
    [safeContracts, clientId, clientIri, parentCompanyIri],
  );

  useFocusEffect(
    useCallback(() => {
      if (!currentCompany?.id || !clientId) {
        return;
      }

      contractActions.getItems(
        buildClientContractsParams({
          currentCompanyId: currentCompany.id,
          clientId,
          clientIri,
          parentCompanyIri,
        }),
      );
    }, [currentCompany?.id, clientId, clientIri, parentCompanyIri, contractActions]),
  );

  const renderContract = contract => (
    <View key={contract.id} style={contractStyles.contractCard}>
      <View style={contractStyles.contractHeader}>
        <View style={contractStyles.headerContent}>
          <Text style={contractStyles.contractTitle}>
            {contract.contractModel.model}
          </Text>
          <View
            style={[
              contractStyles.statusBadge,
              {
                backgroundColor: getContractsStatusColor(
                  palette,
                  contract?.status?.realStatus || contract?.status?.status,
                ),
              },
            ]}>
            <Text style={contractStyles.statusText}>
              {contract.status.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={contractStyles.contractBody}>
        <View style={contractStyles.infoRow}>
          <UserAvatar
            name={contract?.provider?.name}
            size={36}
            backgroundColor={palette.buttonBackground}
            borderColor={palette.buttonText}
            borderWidth={2}
            textColor={palette.buttonText}
            style={contractStyles.infoAvatar}
          />
          <View style={contractStyles.infoContent}>
            <Text style={contractStyles.infoLabel}>
              {global.t?.t('contract', 'label', 'beneficiary')}
            </Text>
            <Text style={contractStyles.infoValue}>
              {contract.provider.name}
            </Text>
          </View>
        </View>

        <View style={contractStyles.dateContainer}>
          <View style={contractStyles.dateItem}>
            <Icon name="event" size={16} color={palette.listItemIcon} />
            <Text style={contractStyles.dateLabel}>{global.t?.t('contract', 'label', 'start')}</Text>
            <Text style={contractStyles.dateValue}>
              {new Date(contract.startDate).toLocaleDateString('pt-br')}
            </Text>
          </View>
          <View style={contractStyles.dateItem}>
            <Icon
              name="event-available"
              size={16}
              color={palette.listItemIcon}
            />
            <Text style={contractStyles.dateLabel}>{global.t?.t('contract', 'label', 'end')}</Text>
            <Text style={contractStyles.dateValue}>
              {new Date(contract.endDate).toLocaleDateString('pt-br')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={contractStyles.viewButton}
        onPress={() =>
          navigation.navigate('ContractDetails', {contractId: contract.id})
        }>
        <Text style={contractStyles.viewButtonText}>{global.t?.t('contract', 'label', 'viewDetails')}</Text>
        <Icon name="arrow-forward" size={16} color={palette.buttonIcon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={contractStyles.container}>
      <View style={contractStyles.header}>
        <Text style={contractStyles.headerTitle}>{global.t?.t('contract', 'label', 'contract')}</Text>
        <Text style={contractStyles.headerSubtitle}>
          {contractsByClient.length}{' '}
          {global.t?.t(
            'contract',
            'label',
            contractsByClient.length === 1 ? 'contract' : 'contracts',
          )}
        </Text>
      </View>

      {isLoading ? (
        <View style={contractStyles.centerContent}>
          <ActivityIndicator size="large" color={palette.loadingSpinner} />
          <Text style={contractStyles.loadingText}>
            {global.t?.t('contract', 'label', 'loadingContracts')}
          </Text>
        </View>
      ) : error ? (
        <View style={contractStyles.centerContent}>
          <Icon name="error-outline" size={48} color={palette.iconDanger} />
          <Text style={contractStyles.errorText}>
            {global.t?.t('contract', 'label', 'errorLoadingContracts')}
          </Text>
          <Text style={contractStyles.errorDetail}>{error}</Text>
        </View>
      ) : contractsByClient.length === 0 ? (
        <View style={contractStyles.centerContent}>
          <Icon name="description" size={48} color={palette.iconDisabled} />
          <Text style={contractStyles.emptyTitle}>
            {emptyState.title}
          </Text>
          <Text style={contractStyles.emptySubtitle}>
            {emptyState.subtitle}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={contractStyles.scrollView}
          showsVerticalScrollIndicator={false}>
          {contractsByClient.map(renderContract)}
          <View style={contractStyles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Contracts;
