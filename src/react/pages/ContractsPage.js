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
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import ContractCard from './ContractCard';
import { Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput, RefreshControl, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStore } from '@store';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAdd from 'react-native-vector-icons/MaterialIcons';
import CreateContractModal from '../components/CreateContractModal';
import { getPeopleDisplayName } from '@controleonline/ui-common/src/react/utils/peopleDisplay';
import {createStyles} from './ContractsPage.styles';
import {
  buildContractsPalette,
  getContractsStatusColor,
  normalizeContractsStatusKey,
} from '../theme/contractsTheme';
const {resolveContractsListEmptyState} = require('../utils/contractEmptyState');

const ContractsPage = () => {
  const themeStore = useStore('theme');
  const themeColors = themeStore?.getters?.colors || {};
  const palette = useMemo(() => buildContractsPalette(themeColors), [themeColors]);
  const contractStyles = useMemo(() => createStyles(palette), [palette]);
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
  const [refreshing, setRefreshing] = useState(false);
  const [allContracts, setAllContracts] = useState([]);
  const [selectedStatusFilterKey, setSelectedStatusFilterKey] = useState('');
  const [peopleNameById, setPeopleNameById] = useState({});
  const [peopleTypeById, setPeopleTypeById] = useState({});
  const normalizeDigits = value => String(value || '').replace(/\D/g, '');
  const normalizeText = value => String(value || '').trim();

  const {
    getContractClientName,
    isContractClientPendingResolution,
    getContractPartyCandidates,
    extractPeopleId,
    getResolvedPeopleName,
    getResolvedPeopleType,
  } = createContractClientResolvers({
    currentCompany,
    peopleNameById,
    getPeopleDisplayName,
  });


  const fetchContracts = useCallback(
    (query, page, statusFilterParam) => {
      if (!currentCompany?.id) {
        return;
      }

      const params = {
        provider: currentCompany.id,
        'contractModel.context': 'contract',
        page: page ?? currentPage,
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
    [currentCompany?.id, currentPage, searchQuery, selectedStatusFilterKey],
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
  }, [searchQuery, selectedStatusFilterKey]);

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
    return getContractsStatusColor(palette, status);
  };

  const getStatusLabel = status => {
    const normalized = normalizeContractsStatusKey(status);
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

      const normalizedStatus = normalizeContractsStatusKey(
        contract?.status?.realStatus || contract?.status?.status,
      );
      const normalizedFilter = normalizeContractsStatusKey(
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
    <ContractCard
      key={contract.id}
      contract={contract}
      navigation={navigation}
      contractStyles={contractStyles}
      palette={palette}
      getStatusColor={getStatusColor}
      getStatusLabel={getStatusLabel}
      getContractClientName={getContractClientName}
      isContractClientPendingResolution={isContractClientPendingResolution}
    />
  );

  return (
    <View style={contractStyles.container}>
      <View style={contractStyles.subHeader}>
        <View style={contractStyles.searchRow}>
          <View style={contractStyles.searchInputContainer}>
            <Icon name="search" size={16} color={palette.inputIcon} />
            <TextInput
              style={contractStyles.searchInput}
              placeholder="Buscar cliente..."
              placeholderTextColor={palette.inputPlaceholderText}
              value={searchText}
              onChangeText={setSearchText}
              underlineColorAndroid={palette.inputBackground}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={contractStyles.clearSearchButton}>
                <Icon
                  name="times-circle"
                  size={16}
                  color={palette.inputIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={contractStyles.addButton}
            onPress={() => setCreateModalVisible(true)}>
            <IconAdd name="add" size={24} color={palette.buttonIcon} />
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
                      borderColor: isActive ? item.color : palette.chipBorder,
                      backgroundColor: isActive
                        ? palette.chipSelectedBackground
                        : palette.chipBackground,
                    },
                  ]}>
                  <Text
                    style={[
                      contractStyles.statusFilterChipText,
                      { color: isActive ? item.color : palette.chipText },
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
              <View style={{paddingTop: 8}}>
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
                <Icon
                  name="exclamation-triangle"
                  size={48}
                  color={palette.iconDanger}
                  style={{marginBottom: 14}}
                />
                <Text style={contractStyles.emptyTitle}>Erro ao carregar contratos</Text>
                <Text style={contractStyles.emptySubtitle}>Tente novamente mais tarde</Text>
              </View>
            );
          }
          return (
            <View style={contractStyles.emptyContainer}>
              <Icon
                name="file-text-o"
                size={64}
                color={palette.iconDisabled}
                style={{marginBottom: 14}}
              />
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
            <View style={{paddingVertical: 20}}>
              <ActivityIndicator size="small" color={palette.loadingSpinner} />
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
