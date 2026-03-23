import React, { useCallback, useState, useEffect, useLayoutEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStore } from '@store';
import { colors } from '@controleonline/../../src/styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAdd from 'react-native-vector-icons/MaterialIcons';
import CreateContractModal from '../components/CreateContractModal';

const ContractsPage = () => {
  const peopleStore = useStore('people');
  const { currentCompany } = peopleStore.getters;
  const peopleActions = peopleStore.actions;
  const contractStore = useStore('contract');
  const contractGetters = contractStore.getters;
  const contractActions = contractStore.actions;
  const { items: contracts, totalItems, isLoading, error } = contractGetters;
  const navigation = useNavigation();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [allContracts, setAllContracts] = useState([]);
  const [peopleNameById, setPeopleNameById] = useState({});
  const [peopleTypeById, setPeopleTypeById] = useState({});
  const normalizeDigits = value => String(value || '').replace(/\D/g, '');
  const normalizeText = value => String(value || '').trim();

  const extractPeopleId = person => {
    if (!person) {
      return '';
    }

    if (typeof person === 'string' || typeof person === 'number') {
      return normalizeDigits(person);
    }

    return normalizeDigits(person?.['@id'] || person?.id || person?.people);
  };

  const resolvePeopleName = person => {
    if (!person || typeof person !== 'object') {
      return '';
    }

    return normalizeText(
      person?.name || person?.alias || person?.nickname || person?.realname,
    );
  };

  const getResolvedPeopleName = person => {
    const directName = resolvePeopleName(person);
    if (directName) {
      return directName;
    }

    const personId = extractPeopleId(person);
    return personId ? peopleNameById[personId] || '' : '';
  };

  const getResolvedPeopleType = person => {
    if (person && typeof person === 'object' && person?.peopleType) {
      return String(person.peopleType || '').trim().toUpperCase();
    }

    const personId = extractPeopleId(person);
    return personId
      ? String(peopleTypeById[personId] || '').trim().toUpperCase()
      : '';
  };

  const isLegalEntity = person => getResolvedPeopleType(person) === 'J';

  const getContractPartyCandidates = contract => {
    const participants = Array.isArray(contract?.peoples) ? contract.peoples : [];
    const participantsOrdered = [...participants].sort((left, right) => {
      const leftType = String(left?.peopleType || '').trim().toLowerCase();
      const rightType = String(right?.peopleType || '').trim().toLowerCase();

      const weight = type => {
        if (type === 'provider') return 0;
        if (type === 'contractor') return 1;
        if (type === 'witness') return 2;
        return 3;
      };

      return weight(leftType) - weight(rightType);
    });

    return [
      ...participantsOrdered.map(entry => entry?.people),
      contract?.client,
      contract?.customer,
      contract?.contractor,
      contract?.people,
      contract?.provider,
    ].filter(Boolean);
  };

  const isCurrentCompanyPerson = person => {
    const reference = String(
      typeof person === 'object' ? person?.['@id'] || person?.id : person || '',
    ).trim();
    const companyId = normalizeDigits(currentCompany?.id);
    if (!reference || !companyId) {
      return false;
    }

    const referenceDigits = extractPeopleId(reference);
    return (
      reference === `/people/${companyId}` ||
      reference === `/peoples/${companyId}` ||
      referenceDigits === companyId
    );
  };

  const isIgnoredContractPartyId = (contract, personId) => {
    if (!personId) {
      return true;
    }

    const companyId = normalizeDigits(currentCompany?.id);
    const modelPeopleId = normalizeDigits(contract?.contractModel?.people);
    const signerId = normalizeDigits(contract?.contractModel?.signer);

    return [companyId, modelPeopleId, signerId].some(
      referenceId => referenceId && referenceId === personId,
    );
  };

  const getContractClientName = contract => {
    const candidates = getContractPartyCandidates(contract);
    for (const candidate of candidates) {
      const personId = extractPeopleId(candidate);
      if (personId && isIgnoredContractPartyId(contract, personId)) {
        continue;
      }

      if (personId && isCurrentCompanyPerson(candidate)) {
        continue;
      }

      if (!isLegalEntity(candidate)) {
        continue;
      }

      const name = getResolvedPeopleName(candidate);
      if (name) {
        return name;
      }
    }

    return '';
  };

  const isContractClientPendingResolution = contract => {
    const candidates = getContractPartyCandidates(contract);
    return candidates.some(candidate => {
      const personId = extractPeopleId(candidate);
      if (!personId || isIgnoredContractPartyId(contract, personId)) {
        return false;
      }

      if (isCurrentCompanyPerson(candidate) || !isLegalEntity(candidate)) {
        return false;
      }

      const name = getResolvedPeopleName(candidate);
      return !name;
    });
  };

  const fetchContracts = useCallback(
    (query, page) => {
      if (!currentCompany?.id) {
        return;
      }

      const params = {
        provider: currentCompany.id,
        'contractModel.context': 'contract',
        page: page ?? currentPage,
        itemsPerPage,
      };

      if (String(query ?? searchQuery).trim()) {
        params['peoples.people.name'] = String(query ?? searchQuery).trim();
      }

      contractActions.getItems(params);
    },
    [currentCompany?.id, currentPage, itemsPerPage, searchQuery],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Contratos',
    });
  }, [navigation]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      fetchContracts(searchQuery, currentPage);
    }, [fetchContracts, searchQuery, currentPage]),
  );

  useEffect(() => {
    if (isLoading) return;

    if (contracts && Array.isArray(contracts)) {
      if (currentPage === 1) {
        setAllContracts(contracts);
      } else {
        setAllContracts(prev => {
          const newIds = new Set(contracts.map(c => c.id));
          const filteredPrev = prev.filter(p => !newIds.has(p.id));
          return [...filteredPrev, ...contracts];
        });
      }
    }
  }, [contracts, currentPage, isLoading]);

  useEffect(() => {
    if (!peopleActions?.get || !Array.isArray(allContracts) || allContracts.length === 0) {
      return;
    }

    const missingIds = new Set();

    allContracts.forEach(contract => {
      getContractPartyCandidates(contract).forEach(candidate => {
        const personId = extractPeopleId(candidate);
        if (!personId || isIgnoredContractPartyId(contract, personId)) {
          return;
        }

        if (isCurrentCompanyPerson(candidate)) {
          return;
        }

        const name = getResolvedPeopleName(candidate);
        const peopleType = getResolvedPeopleType(candidate);
        if ((!name || !peopleType) && (!peopleNameById[personId] || !peopleTypeById[personId])) {
          missingIds.add(personId);
        }
      });
    });

    if (missingIds.size === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      const fetchedPeople = await Promise.all(
        [...missingIds].map(async personId => {
          try {
            const person = await peopleActions.get(personId);
            return {
              personId,
              name: resolvePeopleName(person),
              peopleType: String(person?.peopleType || '').trim().toUpperCase(),
            };
          } catch (fetchError) {
            return { personId, name: '', peopleType: '' };
          }
        }),
      );

      if (cancelled) {
        return;
      }

      setPeopleNameById(prev => {
        const next = { ...prev };
        fetchedPeople.forEach(({ personId, name }) => {
          if (name && !next[personId]) {
            next[personId] = name;
          }
        });
        return next;
      });

      setPeopleTypeById(prev => {
        const next = { ...prev };
        fetchedPeople.forEach(({ personId, peopleType }) => {
          if (peopleType && !next[personId]) {
            next[personId] = peopleType;
          }
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [allContracts, peopleActions, currentCompany?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const handleCreateSuccess = () => {
    fetchContracts(searchQuery, 1);
    setCurrentPage(1);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContracts(searchQuery, 1);
    setCurrentPage(1);
    setRefreshing(false);
  }, [fetchContracts, searchQuery]);

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

  // Usa apenas os contratos que vêm da API (já filtrados e paginados)
  const safeContracts = allContracts;

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
              { backgroundColor: getStatusColor(contract.status.status) },
            ]}>
            <Text style={contractStyles.statusText}>
              {contract.status.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={contractStyles.contractBody}>
        <View style={contractStyles.infoRow}>
          <Icon name="user" size={16} color="#64748B" />
          <Text style={contractStyles.infoLabel}>Cliente:</Text>
          <Text style={contractStyles.infoValue}>
            {(() => {
              const clientName = getContractClientName(contract);
              if (clientName) {
                return clientName;
              }

              return isContractClientPendingResolution(contract)
                ? 'Carregando cliente...'
                : 'Cliente nao informado';
            })()}
          </Text>
        </View>

        <View style={contractStyles.dateContainer}>
          <View style={contractStyles.dateItem}>
            <Icon name="calendar" size={16} color="#64748B" />
            <Text style={contractStyles.dateLabel}>Início</Text>
            <Text style={contractStyles.dateValue}>
              {new Date(contract.startDate).toLocaleDateString('pt-br')}
            </Text>
          </View>
          <View style={contractStyles.dateItem}>
            <Icon name="calendar" size={16} color="#64748B" />
            <Text style={contractStyles.dateLabel}>Término</Text>
            <Text style={contractStyles.dateValue}>
              {new Date(contract.endDate).toLocaleDateString('pt-br')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={contractStyles.viewButton}
        onPress={() =>
          navigation.navigate('ContractDetails', { contractId: contract.id })
        }>
        <Text style={contractStyles.viewButtonText}>Ver Detalhes</Text>
        <Icon name="arrow-right" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={contractStyles.container}>
      <View style={contractStyles.subHeader}>
        <View style={contractStyles.searchRow}>
          <View style={contractStyles.searchInputContainer}>
            <Icon name="search" size={16} color="#94A3B8" />
            <TextInput
              style={contractStyles.searchInput}
              placeholder="Buscar cliente..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
              underlineColorAndroid="transparent"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={contractStyles.clearSearchButton}>
                <Icon name="times-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={contractStyles.addButton}
            onPress={() => setCreateModalVisible(true)}>
            <IconAdd name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={safeContracts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => renderContract(item)}
        contentContainerStyle={contractStyles.scrollContent}
        ListEmptyComponent={() => {
          if (isLoading && safeContracts.length === 0) {
            return (
              <View style={{ paddingTop: 8 }}>
                {[1, 2, 3, 4].map((k) => (
                  <View key={k} style={contractStyles.skeletonCard}>
                    <View style={[contractStyles.skeletonLine, { width: '50%', height: 16, marginBottom: 12 }]} />
                    <View style={[contractStyles.skeletonLine, { width: '80%', height: 12 }]} />
                  </View>
                ))}
              </View>
            );
          }
          if (error) {
            return (
              <View style={contractStyles.emptyContainer}>
                <Icon name="exclamation-triangle" size={48} color="#e74c3c" style={{ marginBottom: 14 }} />
                <Text style={contractStyles.emptyTitle}>Erro ao carregar contratos</Text>
                <Text style={contractStyles.emptySubtitle}>Tente novamente mais tarde</Text>
              </View>
            );
          }
          return (
            <View style={contractStyles.emptyContainer}>
              <Icon name="file-text-o" size={64} color="#bdc3c7" style={{ marginBottom: 14 }} />
              <Text style={contractStyles.emptyTitle}>Nenhum contrato encontrado</Text>
              <Text style={contractStyles.emptySubtitle}>
                {searchQuery ? 'Tente outros termos de busca' : 'Os contratos aparecerão aqui quando disponíveis'}
              </Text>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (!isLoading && safeContracts.length < totalItems) {
            setCurrentPage((p) => p + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isLoading && safeContracts.length > 0 ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />

      <CreateContractModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </View>
  );
};

const contractStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    color: colors.text,
    fontSize: 14,
  },
  clearSearchButton: { padding: 4 },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  skeletonLine: {
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
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
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
  peopleSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 6,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 6,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  personType: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  personTypeIndicator: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  personTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#495057',
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
    backgroundColor: colors.primary,
    margin: 16,
    marginTop: 0,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default ContractsPage;
