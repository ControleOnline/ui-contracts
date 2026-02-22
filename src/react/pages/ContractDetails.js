import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStores} from '@store';
import css from '@controleonline/ui-orders/src/react/css/orders';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-picker/picker';
import RenderHTML from 'react-native-render-html';

const ContractDetails = () => {
  const {styles, globalStyles} = css();
  const contractStore = useStores(state => state.contract);
  const contractGetters = contractStore.getters;
  const contractActions = contractStore.actions;
  const contract_peoplesStore = useStores(state => state.contract_peoples);
  const contractPeopleActions = contract_peoplesStore.actions;
  const peopleStore = useStores(state => state.people);
  const peopleActions = peopleStore.actions;
  const peopleGetters = peopleStore.getters;

  const {item: contract, isLoading, error} = contractGetters;
  const {items: people, currentCompany} = peopleGetters;
  const statusStore = useStores(state => state.status);
  const statusGetters = statusStore.getters;
  const statusActions = statusStore.actions;
  const {items: status} = statusGetters;
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [newSubscriberRole, setNewSubscriberRole] = useState('Contractor');
  const [subscribers, setSubscribers] = useState([]);
  const [peoplePickerVisible, setPeoplePickerVisible] = useState(false);

  const [, setIsEditing] = useState(false);
  const [editedBeneficiary, setEditedBeneficiary] = useState('');
  const [editedStartDate, setEditedStartDate] = useState('');
  const [editedEndDate, setEditedEndDate] = useState('');
  const {width} = Dimensions.get('window');

  // Estados para os componentes de data separados
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endDay, setEndDay] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [beneficiaryPickerVisible, setBeneficiaryPickerVisible] =
    useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const {contractId} = route.params;

  // Check if contract can be edited (only when status is 'open')
  const canEdit = contract?.status?.status?.toLowerCase() === 'open';

  useEffect(() => {
    contractActions.get(contractId).then(d => {
      if (d.contractFile) {
        fetchContractFile(d.contractFile['@id']);
      }
      if (d.peoples) {
        setSubscribers(d.peoples);
      }
      // Inicializar campos de edição
      setEditedBeneficiary(d.beneficiary?.['@id'] || '');
      setEditedStartDate(d.startDate || '');
      setEditedEndDate(d.endDate || '');
      setEditedStatus(d.status?.['@id'] || '');

      // Inicializar componentes de data separados
      if (d.startDate) {
        const startDate = new Date(d.startDate);
        setStartDay(startDate.getDate().toString());
        setStartMonth((startDate.getMonth() + 1).toString());
        setStartYear(startDate.getFullYear().toString());
      }
      if (d.endDate) {
        const endDate = new Date(d.endDate);
        setEndDay(endDate.getDate().toString());
        setEndMonth((endDate.getMonth() + 1).toString());
        setEndYear(endDate.getFullYear().toString());
      }
    });
    statusActions.getItems({context: 'relationship'});

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
    setFileLoading(true);
    setFileError(null);
    try {
      await contractActions.saveFileContent(contractId, fileContent);
      alert('Alterações salvas com sucesso!');
    } catch (err) {
      setFileError('Erro ao salvar as alterações.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleSignContract = () => {
    contractActions.generate({id: contractId});
    contractActions.sign({id: contractId}).then(() =>
      contractActions.get(contractId).then(d => {
        if (d.contractFile) {
          fetchContractFile(d.contractFile['@id']);
        }
        if (d.peoples) {
          setSubscribers(d.peoples);
        }
      }),
    );
  };

  const handleAddSubscriber = async () => {
    if (!selectedPerson) {
      alert('Por favor, selecione uma pessoa.');
      return;
    }
    try {
      const newSub = await contractPeopleActions.save({
        people: selectedPerson,
        peopleType: newSubscriberRole,
        contract: contract['@id'],
      });
      setSubscribers([...subscribers, newSub]);
      setSelectedPerson(null);
      setNewSubscriberRole('Contractor');
      alert('Assinante adicionado com sucesso!');
    } catch (err) {
      console.log(err, 'erro');
      alert('Erro ao adicionar assinante.');
    }
  };

  const handleRemoveSubscriber = async subscriberId => {
    try {
      await contractPeopleActions.remove(subscriberId);
      setSubscribers(subscribers.filter(sub => sub.id !== subscriberId));
      alert('Assinante removido com sucesso!');
    } catch (err) {
      alert('Erro ao remover assinante.');
    }
  };

  const handleSaveContractDetails = async () => {
    try {
      let formattedStartDate = '';
      let formattedEndDate = '';

      if (startDay && startMonth && startYear) {
        formattedStartDate = `${startYear}-${startMonth.padStart(
          2,
          '0',
        )}-${startDay.padStart(2, '0')}`;
      }

      if (endDay && endMonth && endYear) {
        formattedEndDate = `${endYear}-${endMonth.padStart(
          2,
          '0',
        )}-${endDay.padStart(2, '0')}`;
      }

      const updatedData = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        id: contractId,
      };
      await contractActions.save(updatedData);
      setIsEditing(false);
      alert('Detalhes do contrato atualizados com sucesso!');
      contractActions.get(contractId);
    } catch (err) {
      alert('Erro ao atualizar os detalhes do contrato.', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedBeneficiary(contract.beneficiary?.['@id'] || '');
    setEditedStartDate(contract.startDate || '');
    setEditedEndDate(contract.endDate || '');
    setEditedStatus(contract.status?.['@id'] || '');

    // Resetar componentes de data separados
    if (contract.startDate) {
      const startDate = new Date(contract.startDate);
      setStartDay(startDate.getDate().toString());
      setStartMonth((startDate.getMonth() + 1).toString());
      setStartYear(startDate.getFullYear().toString());
    } else {
      setStartDay('');
      setStartMonth('');
      setStartYear('');
    }

    if (contract.endDate) {
      const endDate = new Date(contract.endDate);
      setEndDay(endDate.getDate().toString());
      setEndMonth((endDate.getMonth() + 1).toString());
      setEndYear(endDate.getFullYear().toString());
    } else {
      setEndDay('');
      setEndMonth('');
      setEndYear('');
    }
  };

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}>
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.editModalContent}>
          <View style={modalStyles.selectModalHeader}>
            <Text style={modalStyles.selectModalTitle}>Editar Contrato</Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={modalStyles.closeButton}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.editModalBody}>
            {/* Data de Início */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Data de Início</Text>
              <View style={modalStyles.dateContainer}>
                <View style={modalStyles.datePickerContainer}>
                  <Text style={modalStyles.dateLabel}>Dia</Text>
                  <View style={modalStyles.pickerContainer}>
                    <Picker
                      selectedValue={startDay}
                      style={modalStyles.datePicker}
                      onValueChange={itemValue => setStartDay(itemValue)}>
                      <Picker.Item label="Dia" value="" />
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <Picker.Item
                          key={day}
                          label={day.toString()}
                          value={day.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={modalStyles.datePickerContainer}>
                  <Text style={modalStyles.dateLabel}>Mês</Text>
                  <View style={modalStyles.pickerContainer}>
                    <Picker
                      selectedValue={startMonth}
                      style={modalStyles.datePicker}
                      onValueChange={itemValue => setStartMonth(itemValue)}>
                      <Picker.Item label="Mês" value="" />
                      <Picker.Item label="Janeiro" value="1" />
                      <Picker.Item label="Fevereiro" value="2" />
                      <Picker.Item label="Março" value="3" />
                      <Picker.Item label="Abril" value="4" />
                      <Picker.Item label="Maio" value="5" />
                      <Picker.Item label="Junho" value="6" />
                      <Picker.Item label="Julho" value="7" />
                      <Picker.Item label="Agosto" value="8" />
                      <Picker.Item label="Setembro" value="9" />
                      <Picker.Item label="Outubro" value="10" />
                      <Picker.Item label="Novembro" value="11" />
                      <Picker.Item label="Dezembro" value="12" />
                    </Picker>
                  </View>
                </View>

                <View style={modalStyles.datePickerContainer}>
                  <Text style={modalStyles.dateLabel}>Ano</Text>
                  <TextInput
                    style={modalStyles.yearInput}
                    value={startYear}
                    onChangeText={setStartYear}
                    placeholder="Ano"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            {/* Data de Término */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Data de Término</Text>
              <View style={modalStyles.dateContainer}>
                <View style={modalStyles.datePickerContainer}>
                  <Text style={modalStyles.dateLabel}>Dia</Text>
                  <View style={modalStyles.pickerContainer}>
                    <Picker
                      selectedValue={endDay}
                      style={modalStyles.datePicker}
                      onValueChange={itemValue => setEndDay(itemValue)}>
                      <Picker.Item label="Dia" value="" />
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <Picker.Item
                          key={day}
                          label={day.toString()}
                          value={day.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={modalStyles.datePickerContainer}>
                  <Text style={modalStyles.dateLabel}>Mês</Text>
                  <View style={modalStyles.pickerContainer}>
                    <Picker
                      selectedValue={endMonth}
                      style={modalStyles.datePicker}
                      onValueChange={itemValue => setEndMonth(itemValue)}>
                      <Picker.Item label="Mês" value="" />
                      <Picker.Item label="Janeiro" value="1" />
                      <Picker.Item label="Fevereiro" value="2" />
                      <Picker.Item label="Março" value="3" />
                      <Picker.Item label="Abril" value="4" />
                      <Picker.Item label="Maio" value="5" />
                      <Picker.Item label="Junho" value="6" />
                      <Picker.Item label="Julho" value="7" />
                      <Picker.Item label="Agosto" value="8" />
                      <Picker.Item label="Setembro" value="9" />
                      <Picker.Item label="Outubro" value="10" />
                      <Picker.Item label="Novembro" value="11" />
                      <Picker.Item label="Dezembro" value="12" />
                    </Picker>
                  </View>
                </View>

                <View style={modalStyles.datePickerContainer}>
                  <Text style={modalStyles.dateLabel}>Ano</Text>
                  <TextInput
                    style={modalStyles.yearInput}
                    value={endYear}
                    onChangeText={setEndYear}
                    placeholder="Ano"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Botões de ação */}
          <View style={modalStyles.editModalFooter}>
            <TouchableOpacity
              style={modalStyles.cancelButton}
              onPress={() => {
                handleCancelEdit();
                setEditModalVisible(false);
              }}>
              <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.saveButton}
              onPress={() => {
                handleSaveContractDetails();
                setEditModalVisible(false);
              }}>
              <Text style={modalStyles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPeopleSelectModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={peoplePickerVisible}
      onRequestClose={() => setPeoplePickerVisible(false)}>
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.selectModalContent}>
          <View style={modalStyles.selectModalHeader}>
            <Text style={modalStyles.selectModalTitle}>Selecionar Pessoa</Text>
            <TouchableOpacity
              onPress={() => setPeoplePickerVisible(false)}
              style={modalStyles.closeButton}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.selectModalBody}>
            {people && people.length > 0 ? (
              people.map(person => (
                <TouchableOpacity
                  key={person.name}
                  style={[
                    modalStyles.selectOption,
                    selectedPerson === person['@id'] &&
                      modalStyles.selectOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedPerson(person['@id']);
                    setPeoplePickerVisible(false);
                  }}>
                  <View style={modalStyles.personInfo}>
                    <View style={modalStyles.avatarContainer}>
                      <Icon name="person" size={20} color="#2529a1" />
                    </View>
                    <View style={modalStyles.personDetails}>
                      <Text
                        style={[
                          modalStyles.personName,
                          selectedPerson?.id === person['@id'] &&
                            modalStyles.selectOptionTextActive,
                        ]}>
                        {person.name}
                      </Text>
                    </View>
                  </View>
                  {selectedPerson === person['@id'] && (
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={modalStyles.emptyState}>
                <Icon name="person-outline" size={48} color="#CCCCCC" />
                <Text style={modalStyles.emptyText}>
                  Nenhuma pessoa encontrada
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderBeneficiarySelectModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={beneficiaryPickerVisible}
      onRequestClose={() => setBeneficiaryPickerVisible(false)}>
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.selectModalContent}>
          <View style={modalStyles.selectModalHeader}>
            <Text style={modalStyles.selectModalTitle}>
              Selecionar Beneficiário
            </Text>
            <TouchableOpacity
              onPress={() => setBeneficiaryPickerVisible(false)}
              style={modalStyles.closeButton}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.selectModalBody}>
            {people && people.length > 0 ? (
              people.map(person => (
                <TouchableOpacity
                  key={person.name}
                  style={[
                    modalStyles.selectOption,
                    editedBeneficiary === person['@id'] &&
                      modalStyles.selectOptionActive,
                  ]}
                  onPress={() => {
                    setEditedBeneficiary(person['@id']);
                    setBeneficiaryPickerVisible(false);
                  }}>
                  <View style={modalStyles.personInfo}>
                    <View style={modalStyles.avatarContainer}>
                      <Icon name="person" size={20} color="#2529a1" />
                    </View>
                    <View style={modalStyles.personDetails}>
                      <Text
                        style={[
                          modalStyles.personName,
                          editedBeneficiary === person['@id'] &&
                            modalStyles.selectOptionTextActive,
                        ]}>
                        {person.name}
                      </Text>
                    </View>
                  </View>
                  {editedBeneficiary === person['@id'] && (
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={modalStyles.emptyState}>
                <Icon name="person-outline" size={48} color="#CCCCCC" />
                <Text style={modalStyles.emptyText}>
                  Nenhuma pessoa encontrada
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[globalStyles.container, {backgroundColor: '#F5F5F5'}]}>
        <ActivityIndicator
          size="large"
          color="#2529a1"
          style={{marginTop: 20}}
        />
      </SafeAreaView>
    );
  }

  if (error || !contract) {
    return (
      <SafeAreaView
        style={[globalStyles.container, {backgroundColor: '#F5F5F5'}]}>
        <Text
          style={[
            globalStyles.errorText,
            {color: '#000000', textAlign: 'center', marginTop: 20},
          ]}>
          {error || 'Contrato não encontrado.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <SafeAreaView style={{backgroundColor: '#FFFFFF'}} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 0,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5E5',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          width: '100%',
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: '#F8F9FA',
            marginLeft: 20,
          }}>
          <Icon name="arrow-back" size={24} color="#2529a1" />
        </TouchableOpacity>
        <Text
          style={[
            globalStyles.title,
            {
              color: '#1A1A1A',
              fontSize: 22,
              fontWeight: '600',
              marginLeft: 16,
              marginRight: 20,
              flex: 1,
            },
          ]}>
          Detalhes do Contrato
        </Text>
      </View>

      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        {/* Contract Info Card */}
        <View
          style={{
            margin: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
            <Text
              style={[
                styles.contractTitle,
                {
                  color: '#1A1A1A',
                  fontSize: 20,
                  fontWeight: '700',
                  flex: 1,
                  textAlign: 'center',
                },
              ]}>
              {contract.contractModel?.model}
            </Text>
            {canEdit && (
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                style={{
                  backgroundColor: '#2529a1',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name="edit"
                  size={16}
                  color="#FFFFFF"
                  style={{marginRight: 4}}
                />
                <Text
                  style={{color: '#FFFFFF', fontWeight: '600', fontSize: 12}}>
                  Editar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status */}
          <View style={{marginBottom: 12}}>
            <Text
              style={{
                color: '#666666',
                fontSize: 14,
                fontWeight: '500',
                marginBottom: 4,
              }}>
              Status
            </Text>
            <View
              style={{
                backgroundColor: '#E8F5E8',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                alignSelf: 'flex-start',
              }}>
              <Text style={{color: '#2E7D32', fontSize: 14, fontWeight: '600'}}>
                {contract.status?.status}
              </Text>
            </View>
          </View>

          {/* Datas */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
            <View style={{flex: 1, marginRight: 8}}>
              <Text
                style={{
                  color: '#666666',
                  fontSize: 14,
                  fontWeight: '500',
                  marginBottom: 4,
                }}>
                Data de Início
              </Text>
              <Text style={{color: '#1A1A1A', fontSize: 14}}>
                {new Date(contract?.startDate).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <View style={{flex: 1, marginLeft: 8}}>
              <Text
                style={{
                  color: '#666666',
                  fontSize: 14,
                  fontWeight: '500',
                  marginBottom: 4,
                }}>
                Data de Término
              </Text>
              <Text style={{color: '#1A1A1A', fontSize: 14}}>
                {contract?.endDate
                  ? new Date(contract.endDate).toLocaleDateString('pt-BR')
                  : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscribers Section */}
        <View
          style={{
            margin: 16,
            marginTop: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}>
          <Text
            style={{
              color: '#1A1A1A',
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16,
            }}>
            Assinantes
          </Text>

          {/* Add Subscriber Form */}
          {canEdit && (
            <View
              style={{
                backgroundColor: '#F8F9FA',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}>
              <Text
                style={{
                  color: '#1A1A1A',
                  fontSize: 16,
                  fontWeight: '500',
                  marginBottom: 12,
                }}>
                Adicionar Novo Assinante
              </Text>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: '#FFFFFF',
                  marginBottom: 12,
                }}
                onPress={() => setPeoplePickerVisible(true)}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                  <Icon
                    name="person"
                    size={20}
                    color="#2529a1"
                    style={{marginRight: 8}}
                  />
                  <Text
                    style={{
                      color: selectedPerson ? '#1A1A1A' : '#999999',
                      fontSize: 16,
                    }}>
                    {selectedPerson
                      ? people &&
                        people.find(p => p['@id'] === selectedPerson)?.name
                      : 'Selecionar pessoa'}
                  </Text>
                </View>
                <Icon name="chevron-down" size={24} color="#666666" />
              </TouchableOpacity>

              {/* Role Selection */}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  marginBottom: 12,
                }}>
                <Picker
                  selectedValue={newSubscriberRole}
                  style={{color: '#1A1A1A'}}
                  onValueChange={itemValue => setNewSubscriberRole(itemValue)}>
                  <Picker.Item label="Contractor" value="Contractor" />
                  <Picker.Item label="Witness" value="Witness" />
                </Picker>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: selectedPerson ? '#2529a1' : '#CCCCCC',
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  elevation: selectedPerson ? 2 : 0,
                  shadowColor: '#2529a1',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: selectedPerson ? 0.3 : 0,
                  shadowRadius: 4,
                }}
                onPress={handleAddSubscriber}
                disabled={!selectedPerson}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontSize: 16,
                  }}>
                  Adicionar Assinante
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {subscribers.length === 0 ? (
            <View
              style={{
                padding: 20,
                alignItems: 'center',
                backgroundColor: '#F8F9FA',
                borderRadius: 8,
              }}>
              <Icon name="person-outline" size={48} color="#CCCCCC" />
              <Text style={{color: '#999999', marginTop: 8, fontSize: 16}}>
                Nenhum assinante adicionado
              </Text>
            </View>
          ) : (
            subscribers.map(subscriber => (
              <View
                key={subscriber.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F8F9FA',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#2529a1',
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#2529a1',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                  <Icon name="person" size={20} color="#FFFFFF" />
                </View>
                <View style={{flex: 1}}>
                  <Text
                    style={{color: '#1A1A1A', fontSize: 16, fontWeight: '600'}}>
                    {subscriber.people?.name || 'Nome não disponível'}
                  </Text>
                  <Text style={{color: '#666666', fontSize: 14}}>
                    {subscriber.peopleType}
                  </Text>
                  {subscriber.contractPercentage && (
                    <Text
                      style={{
                        color: '#2529a1',
                        fontSize: 12,
                        fontWeight: '500',
                      }}>
                      Percentual: {subscriber.contractPercentage}%
                    </Text>
                  )}
                </View>
                {canEdit && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF4444',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => handleRemoveSubscriber(subscriber.id)}>
                    <Icon
                      name="delete"
                      size={16}
                      color="#FFFFFF"
                      style={{marginRight: 4}}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontWeight: '600',
                        fontSize: 14,
                      }}>
                      Remover
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {contract.contractFile && (
          <View
            style={{
              margin: 16,
              marginTop: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 20,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}>
            <Text
              style={{
                color: '#1A1A1A',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 16,
              }}>
              Conteúdo do Contrato
            </Text>

            {fileLoading && (
              <View style={{alignItems: 'center', marginVertical: 16}}>
                <ActivityIndicator size="small" color="#2529a1" />
                <Text style={{color: '#666666', marginTop: 8}}>
                  Carregando...
                </Text>
              </View>
            )}

            {fileError && (
              <View
                style={{
                  backgroundColor: '#FFEBEE',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: '#FF4444',
                }}>
                <Text style={{color: '#C62828', fontSize: 14}}>
                  {fileError}
                </Text>
              </View>
            )}

            <ScrollView style={{flex: 1, padding: 16}}>
              <RenderHTML contentWidth={width} source={{html: fileContent}} />
            </ScrollView>

            {canEdit && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#4CAF50',
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  elevation: 2,
                  shadowColor: '#4CAF50',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
                onPress={handleSaveContent}>
                <Text
                  style={{color: '#FFFFFF', fontWeight: '600', fontSize: 16}}>
                  Salvar Alterações
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sign Contract Button */}
        {canEdit && (
          <View style={{margin: 16, marginTop: 0, marginBottom: 32}}>
            <TouchableOpacity
              style={{
                backgroundColor: '#2529a1',
                padding: 18,
                borderRadius: 12,
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#2529a1',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
              onPress={handleSignContract}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon
                  name="edit"
                  size={20}
                  color="#FFFFFF"
                  style={{marginRight: 8}}
                />
                <Text
                  style={{color: '#FFFFFF', fontWeight: '700', fontSize: 18}}>
                  Assinar Contrato
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Status message when contract cannot be edited */}
        {!canEdit && (
          <View style={{margin: 16, marginTop: 0, marginBottom: 32}}>
            <View
              style={{
                backgroundColor: '#FFF3CD',
                padding: 16,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#FFC107',
                alignItems: 'center',
              }}>
              <Icon
                name="info"
                size={24}
                color="#856404"
                style={{marginBottom: 8}}
              />
              <Text
                style={{
                  color: '#856404',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                Este contrato não pode ser editado
              </Text>
              <Text
                style={{
                  color: '#856404',
                  fontSize: 14,
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                Status atual: {contract?.status?.status}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de edição */}
      {renderEditModal()}

      {/* Modal de seleção de pessoas */}
      {renderPeopleSelectModal()}

      {/* Modal de seleção de beneficiário */}
      {renderBeneficiarySelectModal()}
    </View>
  );
};

const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
  },
  editModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  editModalBody: {
    padding: 20,
    maxHeight: 400,
  },
  editModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#1A1A1A',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  selectInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectInputText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    color: '#1A1A1A',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  datePickerContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  datePicker: {
    color: '#1A1A1A',
    height: 50,
  },
  yearInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#1A1A1A',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  selectModalBody: {
    maxHeight: 400,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectOptionActive: {
    backgroundColor: '#E3F2FD',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  personEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 1,
  },
  personDocument: {
    fontSize: 12,
    color: '#999999',
  },
  selectOptionTextActive: {
    color: '#2529a1',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999999',
    marginTop: 12,
    fontSize: 16,
  },
};

export default ContractDetails;
