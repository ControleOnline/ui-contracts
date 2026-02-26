import React, { useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStores } from '@store';
import css from '@controleonline/ui-orders/src/react/css/orders';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import RenderHTML from 'react-native-render-html';
import CompanySelector from '@controleonline/ui-crm/src/react/components/CompanySelector';
import AnimatedModal from '@controleonline/ui-crm/src/react/components/AnimatedModal';
import { colors } from '@controleonline/../../src/styles/colors';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';

const { width } = Dimensions.get('window');

const GeneralTab = ({
  contract,
  subscribers,
  canEdit,
  setEditModalVisible,
  setPeoplePickerVisible,
  selectedPerson,
  people,
  handleAddSubscriber,
  handleRemoveSubscriber,
  newSubscriberRole,
  setNewSubscriberRole,
}) => {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Contract Info Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informações do Contrato</Text>
          {canEdit && (
            <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editButtonSmall}>
              <Icon name="edit" size={16} color={colors.white} />
              <Text style={styles.editButtonTextSmall}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  contract.status?.status?.toLowerCase() === 'ativo'
                    ? '#ECFDF5'
                    : '#F8FAFC',
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    contract.status?.status?.toLowerCase() === 'ativo'
                      ? colors.success
                      : colors.textSecondary,
                },
              ]}>
              {contract.status?.status}
            </Text>
          </View>
        </View>

        {/* Datas */}
        <View style={styles.datesContainer}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Data de Início</Text>
            <Text style={styles.dateValue}>
              {new Date(contract?.startDate).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Data de Término</Text>
            <Text style={styles.dateValue}>
              {contract?.endDate
                ? new Date(contract.endDate).toLocaleDateString('pt-BR')
                : '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Subscribers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assinantes</Text>

        {/* Add Subscriber Form */}
        {canEdit && (
          <View style={styles.addSubscriberContainer}>
            <Text style={styles.subSectionTitle}>Adicionar Novo Assinante</Text>

            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setPeoplePickerVisible(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon
                  name="person"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: selectedPerson ? colors.text : colors.textSecondary,
                    fontSize: 16,
                  }}>
                  {selectedPerson
                    ? people &&
                    people.find(p => p['@id'] === selectedPerson)?.name
                    : 'Selecionar pessoa'}
                </Text>
              </View>
              <Icon name="keyboard-arrow-down" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Role Selection */}
            <View style={styles.roleSelectionContainer}>
              <Text style={styles.inputLabel}>Função:</Text>
              <View style={styles.roleButtonsRow}>
                <TouchableOpacity
                  style={[styles.roleButton, newSubscriberRole === 'Contractor' && styles.roleButtonActive]}
                  onPress={() => setNewSubscriberRole('Contractor')}>
                  <Text style={[styles.roleButtonText, newSubscriberRole === 'Contractor' && styles.roleButtonTextActive]}>
                    Contratante
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, newSubscriberRole === 'Witness' && styles.roleButtonActive]}
                  onPress={() => setNewSubscriberRole('Witness')}>
                  <Text style={[styles.roleButtonText, newSubscriberRole === 'Witness' && styles.roleButtonTextActive]}>
                    Testemunha
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addSubscriberButton,
                !selectedPerson && styles.disabledButton,
              ]}
              onPress={handleAddSubscriber}
              disabled={!selectedPerson}>
              <Text style={styles.addSubscriberButtonText}>Adicionar Assinante</Text>
            </TouchableOpacity>
          </View>
        )}

        {subscribers.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="person-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum assinante adicionado</Text>
          </View>
        ) : (
          subscribers.map(subscriber => (
            <View key={subscriber.id} style={styles.subscriberItem}>
              <View style={styles.subscriberAvatar}>
                <Icon name="person" size={20} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subscriberName}>
                  {subscriber.people?.name || 'Nome não disponível'}
                </Text>
                <Text style={styles.subscriberRole}>{subscriber.peopleType}</Text>
              </View>
              {canEdit && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveSubscriber(subscriber.id)}>
                  <Icon name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const ContractFileTab = ({
  contract,
  fileContent,
  fileLoading,
  fileError,
  canEdit,
  handleSaveContent,
  handleSignContract,
  width,
}) => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minuta do Contrato</Text>
          </View>

          {fileLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando minuta...</Text>
            </View>
          )}

          {fileError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{fileError}</Text>
            </View>
          )}

          {!fileLoading && (
            contract.contractFile ? (
              <View style={styles.htmlContainer}>
                <RenderHTML
                  contentWidth={width - 64}
                  source={{ html: fileContent }}
                  ignoredDomTags={['meta', 'title']}
                  baseStyle={{ color: '#334155' }}
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="description" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>Nenhuma minuta anexada.</Text>
              </View>
            )
          )}

          {/* Sign Contract Button - Moved inside the scroll view and ensured visibility */}
          {canEdit && (
            <View style={{ marginTop: 20, marginBottom: 20 }}>
              <TouchableOpacity style={styles.signButton} onPress={handleSignContract}>
                <Icon name="edit" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.signButtonText}>Assinar Contrato</Text>
              </TouchableOpacity>
            </View>
          )}

          {!canEdit && (
            <View style={styles.infoBox}>
              <Icon name="info" size={24} color={colors.warning} style={{ marginBottom: 8 }} />
              <Text style={styles.infoBoxTitle}>Este contrato não pode ser editado</Text>
              <Text style={styles.infoBoxText}>Status atual: {contract?.status?.status}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const ContractDetails = () => {
  const {showError, showSuccess, showWarning} = useMessage();
  const navigation = useNavigation();
  const route = useRoute();
  const { contractId } = route.params;
  const { width } = Dimensions.get('window');

  // Stores
  const contractStore = useStores(state => state.contract) || {};
  const contractGetters = contractStore.getters || {};
  const contractActions = contractStore.actions || {};
  const contract_peoplesStore = useStores(state => state.contract_peoples) || {};
  const contractPeopleActions = contract_peoplesStore.actions || {};
  const peopleStore = useStores(state => state.people);
  const peopleActions = peopleStore.actions;
  const peopleGetters = peopleStore.getters;
  const statusStore = useStores(state => state.status);
  const statusActions = statusStore.actions;

  // State
  const { item: contract, isLoading, error } = contractGetters;
  const { items: people, currentCompany } = peopleGetters;
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [newSubscriberRole, setNewSubscriberRole] = useState('Contractor');
  const [subscribers, setSubscribers] = useState([]);
  const [peoplePickerVisible, setPeoplePickerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef(null);

  // Edit State
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endDay, setEndDay] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');


  const canEdit = contract?.status?.status?.toLowerCase() === 'open';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerShadowVisible: false,
      headerStyle: { backgroundColor: '#F8FAFC' },
      headerRight: () => null,
    });
  }, [navigation]);

  // Helper: resolve people IRIs to objects with names
  const resolvePeopleNames = useCallback(async (subscribersList) => {
    const resolved = await Promise.all(
      subscribersList.map(async (sub) => {
        // If people is already an object with name, return as-is
        if (sub.people && typeof sub.people === 'object' && sub.people.name) {
          return sub;
        }
        // If people is a string IRI (e.g. "/people/102814"), fetch the person
        const peopleIri = typeof sub.people === 'string' ? sub.people : sub.people?.['@id'];
        if (peopleIri) {
          try {
            const personId = peopleIri.replace(/\D/g, '');
            const personData = await peopleActions.get(personId);
            return { ...sub, people: personData };
          } catch (e) {
            return sub; // If fetch fails, keep as-is
          }
        }
        return sub;
      })
    );
    return resolved;
  }, [peopleActions]);

  useEffect(() => {
    contractActions.get(contractId).then(async (d) => {
      if (d.contractFile) fetchContractFile(d.contractFile['@id']);
      if (d.peoples && d.peoples.length > 0) {
        const resolvedPeoples = await resolvePeopleNames(d.peoples);
        setSubscribers(resolvedPeoples);
      }

      if (d.startDate) {
        const date = new Date(d.startDate);
        setStartDay(date.getDate().toString());
        setStartMonth((date.getMonth() + 1).toString());
        setStartYear(date.getFullYear().toString());
      }
      if (d.endDate) {
        const date = new Date(d.endDate);
        setEndDay(date.getDate().toString());
        setEndMonth((date.getMonth() + 1).toString());
        setEndYear(date.getFullYear().toString());
      }
    });

    statusActions.getItems({ context: 'relationship' });
    peopleActions.getItems({
      company: '/people/' + currentCompany.id,
      link_type: 'client',
    });
  }, [contractId, currentCompany.id]);

  const fetchContractFile = useCallback(async fileId => {
    setFileLoading(true);
    setFileError(null);
    try {
      const response = await contractActions.getFileAsHtml(fileId);
      setFileContent(response.content || '');
    } catch (err) {
      setFileError('Erro ao carregar o conteúdo HTML do contrato.');
    } finally {
      setFileLoading(false);
    }
  });

  const handleSaveContent = async () => {
    // This function is kept but effectively unused/only for programmatic saves if needed
    // or can be removed if strictly no saving is allowed. 
    // Keeping minimal logic or can remove entirely. 
    // Given user requirement "remove edit button", I will remove the button but keeps the function 
    // in case they want it back or for other logic, but removing the UI trigger.
    // Actually, user said "retire o botão editar... vamos seguir padrão". 
    // So the manual editing is gone. 
  };

  const handleSignContract = () => {
    contractActions.generate({ id: contractId });
    contractActions.sign({ id: contractId }).then(() =>
      contractActions.get(contractId).then(async (d) => {
        if (d.contractFile) fetchContractFile(d.contractFile['@id']);
        if (d.peoples && d.peoples.length > 0) {
          const resolvedPeoples = await resolvePeopleNames(d.peoples);
          setSubscribers(resolvedPeoples);
        }
      }),
    );
  };

  const handleAddSubscriber = async () => {
    if (!selectedPerson) {
      showWarning('Por favor, selecione uma pessoa.');
      return;
    }
    try {
      const newSub = await contractPeopleActions.save({
        people: selectedPerson,
        peopleType: newSubscriberRole,
        contract: contract['@id'],
      });
      // Enrich with person name from local people list
      const personFromList = people?.find(p => p['@id'] === selectedPerson);
      const enrichedSub = {
        ...newSub,
        people: personFromList || { '@id': selectedPerson, name: selectedPerson },
      };
      setSubscribers([...subscribers, enrichedSub]);
      setSelectedPerson(null);
      setNewSubscriberRole('Contractor');
      showSuccess('Assinante adicionado com sucesso!');
    } catch (err) {
      showError('Erro ao adicionar assinante.');
    }
  };

  const handleRemoveSubscriber = async subscriberId => {
    try {
      await contractPeopleActions.remove(subscriberId);
      setSubscribers(subscribers.filter(sub => sub.id !== subscriberId));
      showSuccess('Assinante removido com sucesso!');
    } catch (err) {
      showError('Erro ao remover assinante.');
    }
  };

  const handleSaveContractDetails = async () => {
    try {
      let formattedStartDate = '';
      let formattedEndDate = '';

      if (startDay && startMonth && startYear) {
        formattedStartDate = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
      }
      if (endDay && endMonth && endYear) {
        formattedEndDate = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
      }

      await contractActions.save({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        id: contractId,
      });
      setEditModalVisible(false);
      showSuccess('Detalhes atualizados com sucesso!');
      contractActions.get(contractId);
    } catch (err) {
      showError('Erro ao atualizar os detalhes.');
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    if (contract.startDate) {
      const date = new Date(contract.startDate);
      setStartDay(date.getDate().toString());
      setStartMonth((date.getMonth() + 1).toString());
      setStartYear(date.getFullYear().toString());
    } else {
      setStartDay(''); setStartMonth(''); setStartYear('');
    }
    if (contract.endDate) {
      const date = new Date(contract.endDate);
      setEndDay(date.getDate().toString());
      setEndMonth((date.getMonth() + 1).toString());
      setEndYear(date.getFullYear().toString());
    } else {
      setEndDay(''); setEndMonth(''); setEndYear('');
    }
  };

  const handleTabPress = index => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const tabs = [
    { key: 0, label: 'Visão Geral' },
    { key: 1, label: 'Minuta' },
  ];

  if (isLoading || !contract) {
    return (
      <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Profile */}
      <View style={styles.headerProfile}>
        <View style={styles.avatarContainer}>
          <Icon name="description" size={32} color={colors.white} />
        </View>
        <Text style={styles.profileName}>{contract.contractModel?.model}</Text>
        <Text style={styles.profileId}>ID: {contract.id}</Text>
      </View>

      {/* Tabs Header */}
      <View style={styles.tabsHeader}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => handleTabPress(tab.key)}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabs Content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={event => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const currentIndex = Math.round(contentOffsetX / width);
          if (currentIndex !== activeTab) setActiveTab(currentIndex);
        }}
        scrollEventThrottle={16}
        style={styles.contentContainer}>
        <View style={{ width, height: '100%' }}>
          <GeneralTab
            contract={contract}
            subscribers={subscribers}
            canEdit={canEdit}
            setEditModalVisible={setEditModalVisible}
            setPeoplePickerVisible={setPeoplePickerVisible}
            selectedPerson={selectedPerson}
            people={people}
            handleAddSubscriber={handleAddSubscriber}
            handleRemoveSubscriber={handleRemoveSubscriber}
            newSubscriberRole={newSubscriberRole}
            setNewSubscriberRole={setNewSubscriberRole}
          />
        </View>
        <View style={{ width, height: '100%' }}>
          <ContractFileTab
            contract={contract}
            fileContent={fileContent}
            fileLoading={fileLoading}
            fileError={fileError}
            canEdit={canEdit}
            handleSignContract={handleSignContract}
            width={width}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <AnimatedModal
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Contrato</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 400 }}>
            {/* Simple Date Pickers Implementation for brevity - same as before but styled */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Início</Text>
              <View style={styles.dateRow}>
                <TextInput style={styles.dateInput} placeholder="Dia" value={startDay} onChangeText={setStartDay} keyboardType="numeric" maxLength={2} />
                <TextInput style={styles.dateInput} placeholder="Mês" value={startMonth} onChangeText={setStartMonth} keyboardType="numeric" maxLength={2} />
                <TextInput style={styles.dateInput} placeholder="Ano" value={startYear} onChangeText={setStartYear} keyboardType="numeric" maxLength={4} />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Término</Text>
              <View style={styles.dateRow}>
                <TextInput style={styles.dateInput} placeholder="Dia" value={endDay} onChangeText={setEndDay} keyboardType="numeric" maxLength={2} />
                <TextInput style={styles.dateInput} placeholder="Mês" value={endMonth} onChangeText={setEndMonth} keyboardType="numeric" maxLength={2} />
                <TextInput style={styles.dateInput} placeholder="Ano" value={endYear} onChangeText={setEndYear} keyboardType="numeric" maxLength={4} />
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveContractDetails}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>

      <AnimatedModal
        visible={peoplePickerVisible}
        onRequestClose={() => setPeoplePickerVisible(false)}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Pessoa</Text>
            <TouchableOpacity onPress={() => setPeoplePickerVisible(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 400 }}>
            {people?.map(person => (
              <TouchableOpacity
                key={person['@id']}
                style={[styles.personItem, selectedPerson === person['@id'] && styles.personItemActive]}
                onPress={() => { setSelectedPerson(person['@id']); setPeoplePickerVisible(false); }}
              >
                <Text style={styles.personNameList}>{person.name}</Text>
                {selectedPerson === person['@id'] && <Icon name="check" size={20} color={colors.primary} />}
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
    backgroundColor: '#F8FAFC',
  },
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
    paddingHorizontal: 20,
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
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
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
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  editButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonTextSmall: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  addSubscriberContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  roleSelectContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginBottom: 12,
  },
  addSubscriberButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  addSubscriberButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  subscriberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subscriberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    opacity: 0.8,
  },
  subscriberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  subscriberRole: {
    fontSize: 13,
    color: '#64748B',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 15,
  },
  saveContentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveContentButtonText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  htmlContainer: {
    backgroundColor: '#fff',
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  signButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    marginTop: 12,
  },
  bottomSheetContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  personItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  personItemActive: {
    backgroundColor: '#F0F9FF',
  },
  personNameList: {
    fontSize: 16,
    color: '#334155',
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 20
  },
  infoBoxTitle: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBoxText: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },

  roleSelectionContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleButtonActive: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.primary,
  },
  roleButtonText: {
    fontWeight: '600',
    color: '#64748B',
  },
  roleButtonTextActive: {
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  editModeButtonActive: {
    backgroundColor: '#E0F2FE',
  },
  editModeButtonText: {
    fontSize: 13,
    marginLeft: 6,
    color: '#64748B',
    fontWeight: '600',
  },
  htmlInput: {
    minHeight: 300,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 14,
    color: '#334155',
    fontFamily: 'monospace',
  },
});

export default ContractDetails;
