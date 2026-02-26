import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useStores } from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedModal from '@controleonline/ui-crm/src/react/components/AnimatedModal';
import { Picker } from '@react-native-picker/picker';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';

const CreateContractModal = ({ visible, onClose, onSuccess }) => {
  const {showError} = useMessage();
  const contractStore = useStores(state => state.contract);
  const contractActions = contractStore?.actions || {};
  const peopleStore = useStores(state => state.people);
  const peopleGetters = peopleStore?.getters || {};
  const modelsStore = useStores(state => state.model);
  const modelsActions = modelsStore?.actions || {};

  const { currentCompany } = peopleGetters;

  const [isLoading, setIsLoading] = useState(false);
  const [contractModels, setContractModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Form fields
  const [selectedModel, setSelectedModel] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');

  // Modal states
  const [modelPickerVisible, setModelPickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);

  const loadInitialData = async () => {
    try {
      await loadContractModels();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const loadContractModels = async () => {
    setLoadingModels(true);
    try {
      const response = await modelsActions.getItems({ context: 'contract' });

      setContractModels(response);
    } catch (error) {
    } finally {
      setLoadingModels(false);
    }
  };

  const formatDate = (year, month, day) => {
    if (!year || !month || !day) {
      return null;
    }

    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');

    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const handleSubmit = async () => {
    if (!selectedModel) {
      showError('Por favor, selecione um modelo de contrato.');
      return;
    }

    setIsLoading(true);
    try {
      const contractData = {
        contractModel: selectedModel,
        beneficiary: 'people/' + currentCompany.id,
        startDate: formatDate(startYear, startMonth, startDay),
      };

      await contractActions.save(contractData);

      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      showError('Erro ao criar contrato. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedModel('');
    setStartDay('');
    setStartMonth('');
    setStartYear('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderModelSelectModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modelPickerVisible}
      onRequestClose={() => setModelPickerVisible(false)}>
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Selecionar Modelo</Text>
            <TouchableOpacity
              onPress={() => setModelPickerVisible(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.pickerModalBody}>
            {loadingModels ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2529a1" />
                <Text style={styles.loadingText}>Carregando modelos...</Text>
              </View>
            ) : contractModels.length > 0 ? (
              contractModels.map(model => (
                <TouchableOpacity
                  key={model['@id']}
                  style={[
                    styles.selectOption,
                    selectedModel === model['@id'] && styles.selectOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedModel(model['@id']);
                    setModelPickerVisible(false);
                  }}>
                  <View style={styles.modelInfo}>
                    <View style={styles.iconContainer}>
                      <Icon name="description" size={20} color="#2529a1" />
                    </View>
                    <Text
                      style={[
                        styles.modelName,
                        selectedModel === model['@id'] &&
                        styles.selectOptionTextActive,
                      ]}>
                      {model.model}
                    </Text>
                  </View>
                  {selectedModel === model['@id'] && (
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="description" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>Nenhum modelo encontrado</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={handleClose}
      style={{ justifyContent: 'flex-end' }}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Criar Novo Contrato</Text>
          <TouchableOpacity onPress={handleClose} style={styles.headerCloseButton}>
            <Icon name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          {/* Modelo do Contrato */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Modelo do Contrato <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setModelPickerVisible(true)}>
              <View style={styles.selectInputContent}>
                <Icon
                  name="description"
                  size={20}
                  color="#2529a1"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.selectInputText,
                    { color: selectedModel ? '#1A1A1A' : '#999999' },
                  ]}>
                  {selectedModel
                    ? contractModels.find(m => m['@id'] === selectedModel)?.model
                    : 'Selecionar modelo'}
                </Text>
              </View>
              <Icon name="keyboard-arrow-down" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Data de Início */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Data de Início</Text>
            <View style={styles.dateContainer}>
              {/* Dia */}
              <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>Dia</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={startDay}
                    style={styles.picker}
                    onValueChange={itemValue => setStartDay(itemValue)}>
                    <Picker.Item label="Dia" value="" />
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <Picker.Item
                        key={day}
                        label={day.toString()}
                        value={day.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Mês */}
              <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>Mês</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={startMonth}
                    style={styles.picker}
                    onValueChange={itemValue => setStartMonth(itemValue)}>
                    <Picker.Item label="Mês" value="" />
                    <Picker.Item label="Jan" value="1" />
                    <Picker.Item label="Fev" value="2" />
                    <Picker.Item label="Mar" value="3" />
                    <Picker.Item label="Abr" value="4" />
                    <Picker.Item label="Mai" value="5" />
                    <Picker.Item label="Jun" value="6" />
                    <Picker.Item label="Jul" value="7" />
                    <Picker.Item label="Ago" value="8" />
                    <Picker.Item label="Set" value="9" />
                    <Picker.Item label="Out" value="10" />
                    <Picker.Item label="Nov" value="11" />
                    <Picker.Item label="Dez" value="12" />
                  </Picker>
                </View>
              </View>

              {/* Ano */}
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Ano</Text>
                <TextInput
                  style={styles.yearInput}
                  value={startYear}
                  onChangeText={setStartYear}
                  placeholder="2024"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!selectedModel || isLoading) && styles.createButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading || !selectedModel}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {renderModelSelectModal()}
    </AnimatedModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  required: {
    color: '#FF4444',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  selectInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectInputText: {
    fontSize: 16,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    color: '#1A1A1A',
  },
  yearInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12, // Adjusted for cleaner look
    height: 50,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6c757d',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Picker Modal Styles (Separate for Model Selection)
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  pickerModalBody: {
    maxHeight: 300,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  selectOptionActive: {
    backgroundColor: '#F8F9FF',
  },
  selectOptionTextActive: {
    color: '#2529a1',
    fontWeight: '600',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
});

export default CreateContractModal;
