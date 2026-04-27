import React, {useCallback, useMemo} from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStores} from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import contractStyles from './contracts.styles';

const Contracts = ({client}) => {
  const peopleStore = useStores(state => state.people);
  const peopleGetters = peopleStore.getters;
  const {currentCompany} = peopleGetters;
  const contractStore = useStores(state => state.contract);
  const contractGetters = contractStore.getters;
  const contractActions = contractStore.actions;
  const {items: contracts, isLoading, error} = contractGetters;
  const navigation = useNavigation();
  const clientId = String(
    client?.id || client?.['@id']?.toString().replace(/\D/g, '') || '',
  );
  const clientIri = client?.['@id'] || (clientId ? `/people/${clientId}` : '');

  const normalizeDigits = value => String(value || '').replace(/\D/g, '');

  const getEntryIdentifiers = entry => {
    const identifiers = [];
    const people = entry?.people;

    if (typeof people === 'string') {
      identifiers.push(people);
      const digits = normalizeDigits(people);
      if (digits) {
        identifiers.push(digits);
      }
    } else if (people && typeof people === 'object') {
      if (people['@id']) {
        identifiers.push(people['@id']);
      }
      if (people.id != null) {
        identifiers.push(String(people.id));
      }
    }

    if (entry?.peopleId != null) {
      identifiers.push(String(entry.peopleId));
    }

    return identifiers;
  };

  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const contractsByClient = useMemo(() => {
    if (!clientId) {
      return safeContracts;
    }

    const hasInspectablePeople = safeContracts.some(contract =>
      Array.isArray(contract?.peoples)
        ? contract.peoples.some(entry => getEntryIdentifiers(entry).length > 0)
        : false,
    );

    if (!hasInspectablePeople) {
      return safeContracts;
    }

    return safeContracts.filter(contract =>
      Array.isArray(contract?.peoples)
        ? contract.peoples.some(entry =>
            getEntryIdentifiers(entry).some(identifier => {
              if (!identifier) {
                return false;
              }
              return (
                identifier === clientIri ||
                normalizeDigits(identifier) === clientId
              );
            }),
          )
        : false,
    );
  }, [safeContracts, clientId, clientIri]);

  useFocusEffect(
    useCallback(() => {
      if (!currentCompany?.id || !clientId) {
        return;
      }

      contractActions.getItems({
        provider: currentCompany.id,
        'contractModel.context': 'contract',
        'peoples.people': clientIri,
        'peoples.people.id': clientId,
      });
    }, [currentCompany?.id, clientId, clientIri]),
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
            Nenhum contrato cadastrado
          </Text>
          <Text style={contractStyles.emptySubtitle}>
            Os contratos cadastrados para este cliente aparecerao aqui quando disponiveis
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
