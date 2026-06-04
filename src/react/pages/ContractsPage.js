/*
 * Contract imported from AGENTS.md
 * ## Escopo
 * - `ui-contracts` e a tela React de gestao de contratos.
 * - Este arquivo e a entrada ativa do fluxo de contratos em `src/react`.
 *
 * ## Estado
 *
 * ## Limites
 * - Nao duplicar a regra de contrato em paginas paralelas.
 * - Manter a logica de apresentacao e navegacao de contratos aqui.
 */
import React, { useCallback, useState, useEffect, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput, RefreshControl, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStore } from '@store';
import { colors } from '@controleonline/../../src/styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAdd from 'react-native-vector-icons/MaterialIcons';
import CreateContractModal from '../components/CreateContractModal';
import { getPeopleDisplayName } from '@controleonline/ui-common/src/react/utils/peopleDisplay';
import contractStyles from './ContractsPage.styles';
const {resolveContractsListEmptyState} = require('../utils/contractEmptyState');

import {
  inlineStyle_587_20,
  inlineStyle_600_76,
  inlineStyle_608_65,
  inlineStyle_633_18,
} from './ContractsPage.styles';

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
  const [selectedStatusFilterKey, setSelectedStatusFilterKey] = useState('');
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

    return normalizeText(getPeopleDisplayName(person));
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

  const normalizeStatusKey = value =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');

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
    (query, page, statusFilterParam) => {
      if (!currentCompany?.id) {
        return;
      }

      const params = {
        provider: currentCompany.id,
        'contractModel.context': 'contract',
        page: page ?? currentPage,
        itemsPerPage,
      };

      const normalizedQuery = String(query ?? searchQuery).trim();
      if (normalizedQuery) {
        params['peoples.people.name'] = normalizedQuery;
      }

      const selectedFilter = statusFilterParam ?? selectedStatusFilterKey;
      if (selectedFilter) {
        if (selectedFilter.startsWith('/statuses/')) {
          params.status = selectedFilter;
        } else if (selectedFilter.startsWith('realStatus:')) {
          params['status.realStatus'] = selectedFilter.replace('realStatus:', '');
        }
      }

      contractActions.getItems(params);
    },
    [currentCompany?.id, currentPage, itemsPerPage, searchQuery, selectedStatusFilterKey],
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
  }, [searchQuery, itemsPerPage, selectedStatusFilterKey]);

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
    switch (normalizeStatusKey(status)) {
      case 'open':
      case 'aberto':
        return '#3B82F6';
      case 'ativo':
      case 'active':
      case 'assinado':
      case 'signed':
        return '#4CAF50';
      case 'inativo':
      case 'inactive':
      case 'cancelado':
      case 'canceled':
        return '#F44336';
      case 'pendente':
      case 'pending':
        return '#FF9800';
      case 'closed':
      case 'fechado':
        return '#64748B';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = status => {
    const normalized = normalizeStatusKey(status);
    const map = {
      open: global.t?.t('contract','status', 'open'),
      aberto: global.t?.t('contract','status', 'open'),
      pending: global.t?.t('contract','status', 'pending'),
      pendente: global.t?.t('contract','status', 'pending'),
      closed: global.t?.t('contract','status', 'closed'),
      fechado: global.t?.t('contract','status', 'closed'),
      active: global.t?.t('contract','status', 'active'),
      ativo: global.t?.t('contract','status', 'active'),
      inactive: global.t?.t('contract','status', 'inactive'),
      inativo: global.t?.t('contract','status', 'inactive'),
    };

    return map[normalized] || status || global.t?.t('contract','label', 'na');
  };

  const statusFilterOptions = [
    {
      key: 'realStatus:open',
      label: global.t?.t('contract','status', 'open') || 'Em aberto',
      color: getStatusColor('open'),
      normalizedStatus: 'open',
    },
    {
      key: 'realStatus:pending',
      label: global.t?.t('contract','status', 'pending') || 'Pendente',
      color: getStatusColor('pending'),
      normalizedStatus: 'pending',
    },
    {
      key: 'realStatus:closed',
      label: global.t?.t('contract','status', 'closed') || 'Fechado',
      color: getStatusColor('closed'),
      normalizedStatus: 'closed',
    },
  ];

  const contractMatchesStatusFilter = useCallback(
    (contract, filterKey) => {
      if (!filterKey) {
        return true;
      }

      const normalizedStatus = normalizeStatusKey(
        contract?.status?.realStatus || contract?.status?.status,
      );
      const normalizedFilter = normalizeStatusKey(
        String(filterKey || '').replace('realStatus:', ''),
      );

      return normalizedStatus === normalizedFilter;
    },
    [],
  );

  // Usa apenas os contratos que vêm da API (já filtrados e paginados)
  const safeContracts = selectedStatusFilterKey
    ? allContracts.filter(contract =>
        contractMatchesStatusFilter(contract, selectedStatusFilterKey),
      )
    : allContracts;
  const emptyState = resolveContractsListEmptyState({
    hasSearchQuery: Boolean(String(searchQuery || '').trim()),
    hasStatusFilter: Boolean(selectedStatusFilterKey),
    translate: global.t?.t,
  });

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
              {getStatusLabel(contract.status?.realStatus || contract.status?.status).toUpperCase()}
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

        <View style={contractStyles.statusFilterSection}>
          <Text style={contractStyles.statusFilterLabel}>{global.t?.t('contract','label', 'status')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={contractStyles.statusFilterRow}>
            <TouchableOpacity
              onPress={() => setSelectedStatusFilterKey('')}
              style={[
                contractStyles.statusFilterChip,
                !selectedStatusFilterKey && contractStyles.statusFilterChipActive,
              ]}>
              <Text
                style={[
                  contractStyles.statusFilterChipText,
                  !selectedStatusFilterKey && contractStyles.statusFilterChipTextActive,
                ]}>
                {global.t?.t('contract','filter', 'all')}
              </Text>
            </TouchableOpacity>

            {statusFilterOptions.map(item => {
              const isActive = selectedStatusFilterKey === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setSelectedStatusFilterKey(item.key)}
                  style={[
                    contractStyles.statusFilterChip,
                    isActive && contractStyles.statusFilterChipActive,
                    {
                      borderColor: isActive ? item.color : '#DCE3EC',
                      backgroundColor: isActive ? `${item.color}24` : '#F8FAFC',
                    },
                  ]}>
                  <Text
                    style={[
                      contractStyles.statusFilterChipText,
                      { color: isActive ? item.color : '#64748B' },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
              <View style={inlineStyle_587_20}>
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
                <Icon name="exclamation-triangle" size={48} color="#e74c3c" style={inlineStyle_600_76} />
                <Text style={contractStyles.emptyTitle}>Erro ao carregar contratos</Text>
                <Text style={contractStyles.emptySubtitle}>Tente novamente mais tarde</Text>
              </View>
            );
          }
          return (
            <View style={contractStyles.emptyContainer}>
              <Icon name="file-text-o" size={64} color="#bdc3c7" style={inlineStyle_608_65} />
              <Text style={contractStyles.emptyTitle}>
                {emptyState.title}
              </Text>
              <Text style={contractStyles.emptySubtitle}>
                {emptyState.subtitle}
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
            <View style={inlineStyle_633_18}>
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

export default ContractsPage;
