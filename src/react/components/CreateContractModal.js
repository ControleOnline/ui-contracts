import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStore } from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedModal from '@controleonline/ui-crm/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import { buildOwnedClientsParams, getPeopleDisplayName } from '@controleonline/ui-common/src/react/utils/peopleDisplay';
import styles from './CreateContractModal.styles';

import {
  addProductsToOrder,
  createLinkedOrder,
  fetchLatestProposalForClient,
  fetchLinkedOrder,
  fetchOrderProducts,
  normalizeEntityId,
} from '@controleonline/ui-common/src/react/utils/commercialDocumentOrders';

import {
  inlineStyle_438_6,
  inlineStyle_458_67,
  inlineStyle_473_71,
  inlineStyle_517_18,
} from './CreateContractModal.styles';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatApiError = error => {
  if (!error) return 'Nao foi possivel criar o contrato.';
  if (typeof error === 'string') return error;
  if (Array.isArray(error?.message)) {
    return error.message
      .map(item => item?.message || item?.title || String(item))
      .filter(Boolean)
      .join('\n');
  }

  return error?.message || error?.description || error?.errmsg || 'Nao foi possivel criar o contrato.';
};

const CreateContractModal = ({ visible, onClose, onSuccess }) => {
  const messageApi = useMessage() || {};
  const contractStore = useStore('contract');
  const contractActions = contractStore.actions;
  const peopleStore = useStore('people');
  const peopleGetters = peopleStore.getters;
  const peopleActions = peopleStore.actions;
  const modelsStore = useStore('models');
  const modelsActions = modelsStore.actions;

  const { currentCompany } = peopleGetters;
  const people = useMemo(
    () => (Array.isArray(peopleGetters?.items) ? peopleGetters.items : []),
    [peopleGetters?.items],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [contractModels, setContractModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [clientPickerVisible, setClientPickerVisible] = useState(false);
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible, currentCompany?.id]);

  const selectedClientName = useMemo(
    () => getPeopleDisplayName(people.find(person => person['@id'] === selectedClient)) || '',
    [people, selectedClient],
  );

  const selectedModelName = useMemo(
    () => contractModels.find(model => model['@id'] === selectedModel)?.model || '',
    [contractModels, selectedModel],
  );

  const loadInitialData = async () => {
    try {
      if (!currentCompany?.id) {
        return;
      }

      const clientParams = buildOwnedClientsParams({
        currentCompanyId: currentCompany.id,
        itemsPerPage: 100,
      });

      await Promise.all([
        clientParams ? peopleActions.getItems(clientParams) : Promise.resolve([]),
        loadContractModels(),
      ]);
    } catch (error) {
      messageApi.showError?.(formatApiError(error));
    }
  };

  const loadContractModels = async () => {
    setLoadingModels(true);
    try {
      if (!currentCompany?.id) {
        setContractModels([]);
        return;
      }

      const currentCompanyId = normalizeEntityId(currentCompany.id);
      const companyIri = `/people/${currentCompanyId}`;
      const response = await modelsActions.getItems({
        context: 'contract',
        company: companyIri,
        people: currentCompanyId,
      });

      const filteredModels = Array.isArray(response)
        ? response.filter(model => {
            const modelCompanyId = normalizeEntityId(
              model?.people?.['@id'] ||
                model?.people ||
                model?.company?.['@id'] ||
                model?.company,
            );

            return !modelCompanyId || modelCompanyId === currentCompanyId;
          })
        : [];

      setContractModels(filteredModels);
    } catch (error) {
      setContractModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const formatDate = (year, month, day) => {
    const normalizedYear = String(year || '').replace(/\D/g, '');
    const normalizedMonth = String(month || '').replace(/\D/g, '');
    const normalizedDay = String(day || '').replace(/\D/g, '');

    if (normalizedYear.length !== 4 || !normalizedMonth || !normalizedDay) {
      return null;
    }

    const parsedYear = parseInt(normalizedYear, 10);
    const parsedMonth = parseInt(normalizedMonth, 10);
    const parsedDay = parseInt(normalizedDay, 10);
    const candidate = new Date(parsedYear, parsedMonth - 1, parsedDay);
    const isValidDate =
      candidate.getFullYear() === parsedYear &&
      candidate.getMonth() === parsedMonth - 1 &&
      candidate.getDate() === parsedDay;

    if (!isValidDate) {
      return null;
    }

    return `${normalizedYear}-${normalizedMonth.padStart(2, '0')}-${normalizedDay.padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const startDate = formatDate(startYear, startMonth, startDay);

    if (!selectedModel || !selectedClient) {
      messageApi.showError?.('Selecione o modelo e o responsavel da empresa cliente.');
      return;
    }

    if (!startDate) {
      messageApi.showError?.('Informe uma data inicial valida.');
      return;
    }

    setIsLoading(true);
    try {
      const contractData = {
        contractModel: selectedModel,
        provider: `/people/${currentCompany.id}`,
        client: selectedClient,
        startDate,
      };

      const createdContract = await contractActions.save(contractData);
      const createdOrder = await createLinkedOrder({
        contractRef: createdContract?.['@id'],
        provider: `/people/${currentCompany.id}`,
        client: selectedClient,
        payer: selectedClient,
        app: 'CRM',
        orderType: 'sale',
      });

      let copiedProductsCount = 0;
      const latestProposal = await fetchLatestProposalForClient({
        provider: `/people/${currentCompany.id}`,
        client: selectedClient,
      });

      if (latestProposal?.['@id']) {
        const proposalOrder = await fetchLinkedOrder(latestProposal['@id']);
        if (proposalOrder) {
          const proposalProducts = await fetchOrderProducts(proposalOrder['@id'] || proposalOrder.id);
          copiedProductsCount = proposalProducts.length;

          if (copiedProductsCount > 0) {
            await addProductsToOrder({
              orderId: createdOrder?.id || createdOrder?.['@id'],
              products: proposalProducts.map(orderProduct => ({
                product: orderProduct?.product,
                quantity: orderProduct?.quantity || 1,
              })),
            });
          }
        }
      }

      if (copiedProductsCount > 0) {
        messageApi.showSuccess?.(
          `Contrato criado com ${copiedProductsCount} produto(s) herdado(s) da ultima proposta.`,
        );
      } else {
        messageApi.showSuccess?.(
          'Contrato criado. Nenhum produto foi herdado porque nao encontramos itens na ultima proposta.',
        );
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      messageApi.showError?.(formatApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedModel('');
    setSelectedClient('');
    setStartDay('');
    setStartMonth('');
    setStartYear('');
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const renderModelSelectModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={modelPickerVisible}
      onRequestClose={() => setModelPickerVisible(false)}>
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Selecionar modelo do contrato</Text>
            <TouchableOpacity onPress={() => setModelPickerVisible(false)}>
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
                  style={[styles.selectOption, selectedModel === model['@id'] && styles.selectOptionActive]}
                  onPress={() => {
                    setSelectedModel(model['@id']);
                    setModelPickerVisible(false);
                  }}>
                  <View style={styles.optionInfo}>
                    <View style={styles.iconContainer}>
                      <Icon name="description" size={20} color="#2529a1" />
                    </View>
                    <Text style={[styles.optionName, selectedModel === model['@id'] && styles.selectOptionTextActive]}>
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
                <Text style={styles.emptyText}>Nenhum modelo encontrado.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderClientSelectModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={clientPickerVisible}
      onRequestClose={() => setClientPickerVisible(false)}>
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Selecionar responsavel do cliente</Text>
            <TouchableOpacity onPress={() => setClientPickerVisible(false)}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerModalBody}>
            {people.length > 0 ? (
              people.map(person => (
                <TouchableOpacity
                  key={person['@id']}
                  style={[styles.selectOption, selectedClient === person['@id'] && styles.selectOptionActive]}
                  onPress={() => {
                    setSelectedClient(person['@id']);
                    setClientPickerVisible(false);
                  }}>
                  <View style={styles.optionInfo}>
                    <View style={styles.iconContainer}>
                      <Icon name="person" size={20} color="#2529a1" />
                    </View>
                    <Text style={[styles.optionName, selectedClient === person['@id'] && styles.selectOptionTextActive]}>
                      {getPeopleDisplayName(person)}
                    </Text>
                  </View>
                  {selectedClient === person['@id'] && (
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="business" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDayPicker = () => (
    <Modal
      transparent
      visible={dayPickerVisible}
      animationType="slide"
      onRequestClose={() => setDayPickerVisible(false)}>
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Selecionar dia</Text>
            <TouchableOpacity onPress={() => setDayPickerVisible(false)}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerModalBody}>
            {Array.from({ length: 31 }, (_, index) => index + 1).map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.selectOption, startDay === String(day) && styles.selectOptionActive]}
                onPress={() => {
                  setStartDay(String(day));
                  setDayPickerVisible(false);
                }}>
                <Text style={[styles.optionName, startDay === String(day) && styles.selectOptionTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderMonthPicker = () => (
    <Modal
      transparent
      visible={monthPickerVisible}
      animationType="slide"
      onRequestClose={() => setMonthPickerVisible(false)}>
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Selecionar mes</Text>
            <TouchableOpacity onPress={() => setMonthPickerVisible(false)}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerModalBody}>
            {MONTHS.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[styles.selectOption, startMonth === String(index + 1) && styles.selectOptionActive]}
                onPress={() => {
                  setStartMonth(String(index + 1));
                  setMonthPickerVisible(false);
                }}>
                <Text style={[styles.optionName, startMonth === String(index + 1) && styles.selectOptionTextActive]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={handleClose}
      style={inlineStyle_438_6}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Criar novo contrato</Text>
          <TouchableOpacity onPress={handleClose} style={styles.headerCloseButton}>
            <Icon name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Modelo do contrato <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.selectInput} onPress={() => setModelPickerVisible(true)}>
              <View style={styles.selectInputContent}>
                <Icon name="description" size={20} color="#2529a1" style={inlineStyle_458_67} />
                <Text style={[styles.selectInputText, { color: selectedModel ? '#1A1A1A' : '#999999' }]}>
                  {selectedModelName || 'Selecionar modelo'}
                </Text>
              </View>
              <Icon name="keyboard-arrow-down" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Responsavel / cliente <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.selectInput} onPress={() => setClientPickerVisible(true)}>
              <View style={styles.selectInputContent}>
                <Icon name="business-center" size={20} color="#2529a1" style={inlineStyle_473_71} />
                <Text style={[styles.selectInputText, { color: selectedClient ? '#1A1A1A' : '#999999' }]}>
                  {selectedClientName || 'Selecionar responsavel'}
                </Text>
              </View>
              <Icon name="keyboard-arrow-down" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Data de inicio <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity style={styles.selectInputDate} onPress={() => setDayPickerVisible(true)}>
                <Text style={[styles.selectInputText, !startDay && styles.placeholderText]}>
                  {startDay || 'Dia'}
                </Text>
                <Icon name="arrow-drop-down" size={20} color="#666666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectInputDate} onPress={() => setMonthPickerVisible(true)}>
                <Text style={[styles.selectInputText, !startMonth && styles.placeholderText]}>
                  {startMonth ? MONTHS_SHORT[parseInt(startMonth, 10) - 1] : 'Mes'}
                </Text>
                <Icon name="arrow-drop-down" size={20} color="#666666" />
              </TouchableOpacity>
              <TextInput
                style={styles.yearInput}
                value={startYear}
                onChangeText={text =>
                  setStartYear(String(text || '').replace(/\D/g, '').slice(0, 4))
                }
                placeholder="2026"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Icon name="sync-alt" size={20} color="#2529a1" />
            </View>
            <View style={inlineStyle_517_18}>
              <Text style={styles.infoTitle}>Produtos herdados da ultima proposta</Text>
              <Text style={styles.infoText}>
                Ao criar o contrato, vamos copiar automaticamente os produtos da proposta mais recente deste cliente.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Keyboard.dismiss();
              handleClose();
            }}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!selectedModel || !selectedClient || !formatDate(startYear, startMonth, startDay)) &&
                styles.createButtonDisabled,
            ]}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit();
            }}
            disabled={isLoading || !selectedModel || !selectedClient || !formatDate(startYear, startMonth, startDay)}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Salvar contrato</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {renderModelSelectModal()}
      {renderClientSelectModal()}
      {renderDayPicker()}
      {renderMonthPicker()}
    </AnimatedModal>
  );
};

export default CreateContractModal;
