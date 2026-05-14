import React, {useCallback, useMemo} from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStores} from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import contractStyles from './contracts.styles';
const {resolveClientContractsEmptyState} = require('../utils/contractEmptyState');
const {
  buildClientContractsParams,
  filterContractsByClient,
} = require('../utils/contractClientMatch');

const Contracts = ({client, parentCompanyIri = ''}) => {
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

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return '#4CAF50';
      case 'inativo':
        return '#F44336';
      case 'pendente':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

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
              {backgroundColor: getStatusColor(contract.status.status)},
            ]}>
            <Text style={contractStyles.statusText}>
              {contract.status.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={contractStyles.contractBody}>
        <View style={contractStyles.infoRow}>
          <Icon name="person" size={16} color="#666" />
          <Text style={contractStyles.infoLabel}>{global.t?.t('contract', 'label', 'beneficiary')}</Text>
          <Text style={contractStyles.infoValue}>
            {contract.provider.name}
          </Text>
        </View>

        <View style={contractStyles.dateContainer}>
          <View style={contractStyles.dateItem}>
            <Icon name="event" size={16} color="#666" />
            <Text style={contractStyles.dateLabel}>{global.t?.t('contract', 'label', 'start')}</Text>
            <Text style={contractStyles.dateValue}>
              {new Date(contract.startDate).toLocaleDateString('pt-br')}
            </Text>
          </View>
          <View style={contractStyles.dateItem}>
            <Icon name="event-available" size={16} color="#666" />
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
        <Icon name="arrow-forward" size={16} color="#FFFFFF" />
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
          <ActivityIndicator size="large" color="#2529a1" />
          <Text style={contractStyles.loadingText}>
            {global.t?.t('contract', 'label', 'loadingContracts')}
          </Text>
        </View>
      ) : error ? (
        <View style={contractStyles.centerContent}>
          <Icon name="error-outline" size={48} color="#F44336" />
          <Text style={contractStyles.errorText}>
            {global.t?.t('contract', 'label', 'errorLoadingContracts')}
          </Text>
          <Text style={contractStyles.errorDetail}>{error}</Text>
        </View>
      ) : contractsByClient.length === 0 ? (
        <View style={contractStyles.centerContent}>
          <Icon name="description" size={48} color="#CCCCCC" />
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
