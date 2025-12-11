import React, {useCallback} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStores} from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Contracts = ({client}) => {
  const peopleStore = useStores(state => state.people);
  const peopleGetters = peopleStore.getters;
  const {currentCompany} = peopleGetters;
  const contractStore = useStores(state => state.contract);
  const contractGetters = contractStore.getters;
  const contractActions = contractStore.actions;
  const {items: contracts, isLoading, error} = contractGetters;
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      contractActions.getItems({
        beneficiary: currentCompany.id,
        'contractModel.context': 'contract',
        'peoples.people.id': client.id,
      });
    }, [client, currentCompany]),
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
          <Text style={contractStyles.infoLabel}>Beneficiário:</Text>
          <Text style={contractStyles.infoValue}>
            {contract.beneficiary.name}
          </Text>
        </View>

        <View style={contractStyles.dateContainer}>
          <View style={contractStyles.dateItem}>
            <Icon name="event" size={16} color="#666" />
            <Text style={contractStyles.dateLabel}>Início</Text>
            <Text style={contractStyles.dateValue}>
              {new Date(contract.startDate).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={contractStyles.dateItem}>
            <Icon name="event-available" size={16} color="#666" />
            <Text style={contractStyles.dateLabel}>Término</Text>
            <Text style={contractStyles.dateValue}>
              {new Date(contract.endDate).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={contractStyles.viewButton}
        onPress={() =>
          navigation.navigate('ContractDetails', {contractId: contract.id})
        }>
        <Text style={contractStyles.viewButtonText}>Ver Detalhes</Text>
        <Icon name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={contractStyles.container}>
      <View style={contractStyles.header}>
        <Text style={contractStyles.headerTitle}>Contratos</Text>
        <Text style={contractStyles.headerSubtitle}>
          {contracts.length} contrato{contracts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={contractStyles.centerContent}>
          <ActivityIndicator size="large" color="#2529a1" />
          <Text style={contractStyles.loadingText}>
            Carregando contratos...
          </Text>
        </View>
      ) : error ? (
        <View style={contractStyles.centerContent}>
          <Icon name="error-outline" size={48} color="#F44336" />
          <Text style={contractStyles.errorText}>
            Erro ao carregar contratos
          </Text>
          <Text style={contractStyles.errorDetail}>{error}</Text>
        </View>
      ) : contracts.length === 0 ? (
        <View style={contractStyles.centerContent}>
          <Icon name="description" size={48} color="#CCCCCC" />
          <Text style={contractStyles.emptyTitle}>
            Nenhum contrato encontrado
          </Text>
          <Text style={contractStyles.emptySubtitle}>
            Os contratos aparecerão aqui quando disponíveis
          </Text>
        </View>
      ) : (
        <ScrollView
          style={contractStyles.scrollView}
          showsVerticalScrollIndicator={false}>
          {contracts.map(renderContract)}
          <View style={contractStyles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const contractStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contractHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
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
    color: '#FFFFFF',
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
    color: '#6C757D',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2529a1',
    margin: 16,
    marginTop: 0,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
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
    color: '#6C757D',
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginTop: 16,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default Contracts;
