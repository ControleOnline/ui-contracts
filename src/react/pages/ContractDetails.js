import React, { useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react';
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

const { width, height } = Dimensions.get('window');

const MinutaTab = ({ contract, fileContent, fileLoading, fileError, canEdit, handleSignContract }) => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.tabScroll}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: canEdit ? 100 : 40, // espaço extra quando botão fixo aparece
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
          ) : contract.contractFile ? (
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
              <Icon name="description" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma minuta anexada</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão fixo na parte inferior */}
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
      {/* conteúdo da aba Assinantes igual ao anterior */}
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
                <Text style={styles.subscriberName}>{sub.people?.name || 'Nome não disponível'}</Text>
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
              <Text style={styles.label}>Função</Text>
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

  const scrollRef = useRef(null);

  const canEdit = contract?.status?.realStatus === 'open';

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const loadData = async () => {
      const data = await contractActions.get(contractId);
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

  const handleSignContract = async () => {
    try {
      await contractActions.sign({ id: contractId });
      showSuccess('Contrato assinado com sucesso');
      const updated = await contractActions.get(contractId);
      if (updated?.contractFile) {
        const res = await contractActions.getFileAsHtml(updated.contractFile['@id']);
        setFileContent(res.content || '');
      }
    } catch (err) {
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
      setSubscribers([...subscribers, { ...created, people: person || { name: '—' } }]);
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
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSkeleton} />
        <View style={styles.infoSkeleton} />
        <View style={styles.tabsSkeleton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.pageHeader}>
        <View style={styles.avatar}>
          <Icon name="description" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contractTitle} numberOfLines={1}>
            {contract.contractModel?.model || 'Contrato sem modelo'}
          </Text>
          <Text style={styles.contractId}>ID: {contract.id}</Text>
        </View>
      </View>

      {/* Informações fixas */}
      <View style={styles.fixedInfo}>
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: `${contract.status?.color || '#64748b'}20`,
              borderColor: contract.status?.color || '#94a3b8',
            },
          ]}>
          <Text style={[styles.statusText, { color: contract.status?.color || '#334155' }]}>
            {contract.status?.status?.toUpperCase() || '—'}
          </Text>
        </View>

        <View style={styles.datesRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Início</Text>
            <Text style={styles.dateValue}>
              {contract.startDate ? new Date(contract.startDate).toLocaleDateString('pt-BR') : '—'}
            </Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Término</Text>
            <Text style={styles.dateValue}>
              {contract.endDate ? new Date(contract.endDate).toLocaleDateString('pt-BR') : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 0 && styles.tabActive]}
          onPress={() => handleTabPress(0)}>
          <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>Minuta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 1 && styles.tabActive]}
          onPress={() => handleTabPress(1)}>
          <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>Assinantes</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          if (idx !== activeTab) setActiveTab(idx);
        }}>
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

      {/* Modal */}
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contractTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  contractId: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },

  centerContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 15 },
  emptyText: { marginTop: 16, color: '#94a3b8', fontSize: 15 },
  errorText: { color: colors.error, textAlign: 'center', padding: 24 },

  htmlWrapper: { backgroundColor: '#fff' },

  // Botão fixo na parte inferior
  fixedSignButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // safe area no iOS
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },

  // estilos da aba Assinantes (mantidos resumidos)
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

  headerSkeleton: { height: 100, backgroundColor: '#e2e8f0', margin: 16, borderRadius: 12 },
  infoSkeleton: { height: 140, backgroundColor: '#e2e8f0', marginHorizontal: 16, marginBottom: 8, borderRadius: 12 },
  tabsSkeleton: { height: 56, backgroundColor: '#e2e8f0', marginHorizontal: 16, borderRadius: 12 },
});

export default ContractDetails;