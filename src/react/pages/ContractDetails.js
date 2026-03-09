import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStores } from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHTML from 'react-native-render-html';
import AnimatedModal from '@controleonline/ui-crm/src/react/components/AnimatedModal';
import { colors } from '@controleonline/../../src/styles/colors';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';

const { width } = Dimensions.get('window');

const ResumoTab = ({ contract, clientLabel }) => {
  const statusColor = contract?.status?.color || '#64748B';

  return (
    <ScrollView
      style={styles.tabScroll}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}20`,
                borderColor: statusColor,
              },
            ]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {contract?.status?.status?.toUpperCase() || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>ID</Text>
            <Text style={styles.summaryValue}>{contract?.id || '-'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Inicio</Text>
            <Text style={styles.summaryValue}>
              {contract?.startDate
                ? new Date(contract.startDate).toLocaleDateString('pt-BR')
                : '-'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Termino</Text>
            <Text style={styles.summaryValue}>
              {contract?.endDate
                ? new Date(contract.endDate).toLocaleDateString('pt-BR')
                : '-'}
            </Text>
          </View>
        </View>

        <View style={[styles.summaryItem, styles.summaryItemWide]}>
          <Text style={styles.summaryLabel}>Cliente</Text>
          <Text style={styles.summaryValue}>{clientLabel}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const MinutaTab = ({ contract, fileContent, fileLoading, fileError, canEdit, handleSignContract }) => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.tabScroll}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: canEdit ? 120 : 40,
        }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minuta do Contrato</Text>

          {fileLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando minuta...</Text>
            </View>
          ) : fileError ? (
            <Text style={styles.errorText}>{fileError}</Text>
          ) : fileContent ? (
            <View style={styles.htmlWrapper}>
              <RenderHTML
                contentWidth={width - 32}
                source={{ html: fileContent }}
                ignoredDomTags={['meta', 'title']}
                baseStyle={{ color: '#334155', lineHeight: 24 }}
              />
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Gerando minuta...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {canEdit && (
        <View style={styles.fixedSignButtonContainer}>
          <TouchableOpacity style={styles.signButton} onPress={handleSignContract}>
            <Icon name="edit" size={20} color="#fff" />
            <Text style={styles.signButtonText}>Assinar Contrato</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const AssinantesTab = ({
  subscribers,
  canEdit,
  handleRemoveSubscriber,
  handleAddSubscriber,
  selectedPerson,
  people,
  setPeoplePickerVisible,
  newSubscriberRole,
  setNewSubscriberRole,
}) => {
  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assinantes</Text>

        {subscribers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="people" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum assinante cadastrado</Text>
          </View>
        ) : (
          subscribers.map((sub) => (
            <View key={sub.id} style={styles.subscriberCard}>
              <View style={styles.subscriberAvatar}>
                <Icon name="person" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subscriberName}>{sub.people?.name || 'Nome nao disponivel'}</Text>
                <Text style={styles.subscriberRole}>{sub.peopleType}</Text>
              </View>
              {canEdit && (
                <TouchableOpacity onPress={() => handleRemoveSubscriber(sub.id)}>
                  <Icon name="delete" size={24} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {canEdit && (
          <View style={styles.addForm}>
            <Text style={styles.addTitle}>Adicionar assinante</Text>

            <TouchableOpacity style={styles.selectField} onPress={() => setPeoplePickerVisible(true)}>
              <Icon name="person-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, color: selectedPerson ? '#0f172a' : '#94a3b8' }}>
                {selectedPerson
                  ? people?.find((p) => p['@id'] === selectedPerson)?.name || 'Selecionado'
                  : 'Selecionar pessoa'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#64748b" />
            </TouchableOpacity>

            <View style={{ marginVertical: 12 }}>
              <Text style={styles.label}>Funcao</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, newSubscriberRole === 'Contractor' && styles.roleBtnActive]}
                  onPress={() => setNewSubscriberRole('Contractor')}>
                  <Text style={[styles.roleText, newSubscriberRole === 'Contractor' && { color: colors.primary }]}>
                    Contratante
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleBtn, newSubscriberRole === 'Witness' && styles.roleBtnActive]}
                  onPress={() => setNewSubscriberRole('Witness')}>
                  <Text style={[styles.roleText, newSubscriberRole === 'Witness' && { color: colors.primary }]}>
                    Testemunha
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, !selectedPerson && styles.addButtonDisabled]}
              disabled={!selectedPerson}
              onPress={handleAddSubscriber}>
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const ContractDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { contractId } = route.params;

  const { showSuccess, showError, showWarning } = useMessage();

  const contractStore = useStores((s) => s.contract);
  const contractPeopleStore = useStores((s) => s.contract_peoples);
  const peopleStore = useStores((s) => s.people);

  const { item: contract, isLoading } = contractStore.getters;
  const contractActions = contractStore.actions;
  const contractPeopleActions = contractPeopleStore.actions;
  const peopleActions = peopleStore.actions;
  const { items: people, currentCompany } = peopleStore.getters;

  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [newSubscriberRole, setNewSubscriberRole] = useState('Contractor');
  const [peoplePickerVisible, setPeoplePickerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [peopleNameById, setPeopleNameById] = useState({});

  const scrollRef = useRef(null);

  const canEdit = contract?.status?.realStatus === 'open';
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

  const getContractPartyCandidates = currentContract => {
    const participants = Array.isArray(currentContract?.peoples)
      ? currentContract.peoples
      : [];
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
      currentContract?.client,
      currentContract?.customer,
      currentContract?.contractor,
      currentContract?.people,
      currentContract?.provider,
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

  const isIgnoredContractPartyId = (currentContract, personId) => {
    if (!personId) {
      return true;
    }

    const companyId = normalizeDigits(currentCompany?.id);
    const modelPeopleId = normalizeDigits(currentContract?.contractModel?.people);
    const signerId = normalizeDigits(currentContract?.contractModel?.signer);

    return [companyId, modelPeopleId, signerId].some(
      referenceId => referenceId && referenceId === personId,
    );
  };

  const getContractClientName = currentContract => {
    const candidates = getContractPartyCandidates(currentContract);
    for (const candidate of candidates) {
      const personId = extractPeopleId(candidate);
      if (personId && isIgnoredContractPartyId(currentContract, personId)) {
        continue;
      }

      if (personId && isCurrentCompanyPerson(candidate)) {
        continue;
      }

      const name = getResolvedPeopleName(candidate);
      if (name) {
        return name;
      }
    }

    return '';
  };

  const isContractClientPendingResolution = currentContract => {
    const candidates = getContractPartyCandidates(currentContract);
    return candidates.some(candidate => {
      const personId = extractPeopleId(candidate);
      if (!personId || isIgnoredContractPartyId(currentContract, personId)) {
        return false;
      }

      const name = getResolvedPeopleName(candidate);
      return !name;
    });
  };

  const clientName = getContractClientName(contract);
  const clientLabel = clientName
    ? clientName
    : isContractClientPendingResolution(contract)
    ? 'Carregando cliente...'
    : 'Cliente nao informado';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerShadowVisible: false,
      headerStyle: { backgroundColor: '#F8FAFC' },
      headerRight: () => null,
    });
  }, [navigation]);

  useEffect(() => {
    const loadData = async () => {
      let data = await contractActions.get(contractId);

      if (!data?.contractFile) {
        try {
          await contractActions.generate({ id: contractId });
          data = await contractActions.get(contractId);
        } catch (e) {
          console.log('Erro ao gerar minuta', e);
        }
      }

      if (data?.contractFile) {
        setFileLoading(true);
        try {
          const res = await contractActions.getFileAsHtml(data.contractFile['@id']);
          setFileContent(res.content || '');
        } catch (err) {
          setFileError('Falha ao carregar a minuta');
        } finally {
          setFileLoading(false);
        }
      }

      if (data?.peoples?.length) {
        const resolved = await Promise.all(
          data.peoples.map(async (sub) => {
            if (sub.people?.name) return sub;
            const id = (typeof sub.people === 'string' ? sub.people : sub.people?.['@id'] || '').replace(/\D/g, '');
            if (!id) return sub;
            try {
              const person = await peopleActions.get(id);
              return { ...sub, people: person };
            } catch {
              return sub;
            }
          }),
        );
        setSubscribers(resolved);
      }
    };

    loadData();

    peopleActions.getItems({
      company: currentCompany ? `/people/${currentCompany.id}` : undefined,
      link_type: 'client',
    });
  }, [contractId, currentCompany?.id]);

  useEffect(() => {
    if (!contract || !peopleActions?.get) {
      return;
    }

    const missingIds = new Set();

    getContractPartyCandidates(contract).forEach(candidate => {
      const personId = extractPeopleId(candidate);
      if (!personId || isIgnoredContractPartyId(contract, personId)) {
        return;
      }

      const name = getResolvedPeopleName(candidate);
      if (!name && !peopleNameById[personId]) {
        missingIds.add(personId);
      }
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
            };
          } catch (error) {
            return { personId, name: '' };
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
    })();

    return () => {
      cancelled = true;
    };
  }, [contract, currentCompany?.id, peopleActions, peopleNameById]);

  const handleSignContract = async () => {
    try {
      await contractActions.sign({ id: contractId });
      showSuccess('Contrato assinado com sucesso');
      const updated = await contractActions.get(contractId);
      if (updated?.contractFile) {
        const res = await contractActions.getFileAsHtml(updated.contractFile['@id']);
        setFileContent(res.content || '');
      }
    } catch {
      showError('Erro ao assinar o contrato');
    }
  };

  const handleAddSubscriber = async () => {
    if (!selectedPerson) {
      showWarning('Selecione uma pessoa');
      return;
    }
    try {
      const created = await contractPeopleActions.save({
        people: selectedPerson,
        peopleType: newSubscriberRole,
        contract: contract['@id'],
      });
      const person = people.find((p) => p['@id'] === selectedPerson);
      setSubscribers([...subscribers, { ...created, people: person || { name: '-' } }]);
      setSelectedPerson(null);
      setNewSubscriberRole('Contractor');
      showSuccess('Assinante adicionado');
    } catch {
      showError('Falha ao adicionar assinante');
    }
  };

  const handleRemoveSubscriber = async (id) => {
    try {
      await contractPeopleActions.remove(id);
      setSubscribers(subscribers.filter((s) => s.id !== id));
      showSuccess('Assinante removido');
    } catch {
      showError('Erro ao remover assinante');
    }
  };

  const handleTabPress = (index) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  if (isLoading || !contract) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.topSkeleton} />
        <View style={styles.infoSkeleton} />
        <View style={styles.tabsSkeleton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.headerProfile}>
        <View style={styles.avatarContainer}>
          <Icon name="description" size={32} color="#fff" />
        </View>
        <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
          {contract.contractModel?.model || 'Contrato sem modelo'}
        </Text>
        <Text style={styles.profileId}>{`ID: ${contract.id}`}</Text>
      </View>

      <View style={styles.tabsHeader}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.tabButtonActive]}
          onPress={() => handleTabPress(0)}>
          <Text style={[styles.tabButtonText, activeTab === 0 && styles.tabButtonTextActive]}>
            Resumo
          </Text>
          {activeTab === 0 && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.tabButtonActive]}
          onPress={() => handleTabPress(1)}>
          <Text style={[styles.tabButtonText, activeTab === 1 && styles.tabButtonTextActive]}>
            Minuta
          </Text>
          {activeTab === 1 && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 2 && styles.tabButtonActive]}
          onPress={() => handleTabPress(2)}>
          <Text style={[styles.tabButtonText, activeTab === 2 && styles.tabButtonTextActive]}>
            Assinantes
          </Text>
          {activeTab === 2 && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          if (idx !== activeTab) setActiveTab(idx);
        }}
        scrollEventThrottle={16}
        style={styles.contentContainer}>
        <View style={{ width, flex: 1 }}>
          <ResumoTab contract={contract} clientLabel={clientLabel} />
        </View>

        <View style={{ width, flex: 1 }}>
          <MinutaTab
            contract={contract}
            fileContent={fileContent}
            fileLoading={fileLoading}
            fileError={fileError}
            canEdit={canEdit}
            handleSignContract={handleSignContract}
          />
        </View>

        <View style={{ width, flex: 1 }}>
          <AssinantesTab
            subscribers={subscribers}
            canEdit={canEdit}
            handleRemoveSubscriber={handleRemoveSubscriber}
            handleAddSubscriber={handleAddSubscriber}
            selectedPerson={selectedPerson}
            people={people}
            setPeoplePickerVisible={setPeoplePickerVisible}
            newSubscriberRole={newSubscriberRole}
            setNewSubscriberRole={setNewSubscriberRole}
          />
        </View>
      </ScrollView>

      <AnimatedModal visible={peoplePickerVisible} onRequestClose={() => setPeoplePickerVisible(false)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Pessoa</Text>
            <TouchableOpacity onPress={() => setPeoplePickerVisible(false)}>
              <Icon name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {people?.map((p) => (
              <TouchableOpacity
                key={p['@id']}
                style={[styles.personRow, selectedPerson === p['@id'] && styles.personRowSelected]}
                onPress={() => {
                  setSelectedPerson(p['@id']);
                  setPeoplePickerVisible(false);
                }}>
                <Text style={styles.personName}>{p.name}</Text>
                {selectedPerson === p['@id'] && (
                  <Icon name="check-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </AnimatedModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  headerProfile: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
    maxWidth: '86%',
  },
  profileId: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabButtonActive: {},
  tabButtonText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabButtonTextActive: { color: colors.primary, fontWeight: '700' },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  contentContainer: {
    flex: 1,
  },

  tabScroll: { flex: 1 },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItemWide: {
    marginTop: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },

  centerContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, color: '#64748B', fontSize: 15 },
  emptyText: { marginTop: 16, color: '#94a3b8', fontSize: 15 },
  errorText: { color: colors.error, textAlign: 'center', padding: 24 },

  htmlWrapper: { backgroundColor: '#FFFFFF' },

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

  topSkeleton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  infoSkeleton: {
    height: 22,
    width: 180,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 8,
    borderRadius: 8,
  },
  tabsSkeleton: {
    height: 14,
    width: 120,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    borderRadius: 8,
    marginBottom: 24,
  },
});

export default ContractDetails;
