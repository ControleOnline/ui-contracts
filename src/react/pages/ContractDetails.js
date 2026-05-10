import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStores } from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHTML from 'react-native-render-html';
import AnimatedModal from '@controleonline/ui-crm/src/react/components/AnimatedModal';
import { colors } from '@controleonline/../../src/styles/colors';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import LinkedOrderProductsTab from '@controleonline/ui-common/src/react/components/LinkedOrderProductsTab';
const { resolveContractDetailsBackAction } = require('../utils/contractDetailsNavigation');
import styles from './ContractDetails.styles';

import {
  inlineStyle_61_12,
  inlineStyle_63_14,
  inlineStyle_72_12,
  inlineStyle_74_14,
  inlineStyle_82_10,
  inlineStyle_86_8,
  inlineStyle_101_10,
  inlineStyle_184_20,
  inlineStyle_202_75,
  inlineStyle_203_20,
  inlineStyle_211_18,
  inlineStyle_395_14,
  inlineStyle_464_14,
  inlineStyle_475_14,
  inlineStyle_485_14,
} from './ContractDetails.styles';

import { inlineStyle_128_8, inlineStyle_149_18, inlineStyle_192_41 } from './ContractDetails.styles';
const { width, height } = Dimensions.get('window');

const PdfViewerFromContent = ({ content }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!content || content.length === 0) {
      setError('Nenhum conteúdo de PDF recebido');
      return;
    }

    let url = null;

    try {
      // NÃO modifica, limpa ou mascara nada — assume que content é base64 puro
      console.log('Tentando decodificar base64. Tamanho da string:', content.length);
      console.log('Primeiros 20 caracteres (deve começar com JVBER...):', content.substring(0, 20));

      const byteCharacters = atob(content); // Decodifica diretamente
      const byteNumbers = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteNumbers], { type: 'application/pdf' });
      console.log('Blob criado. Tamanho final:', blob.size, 'bytes');

      url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Erro ao processar PDF (provavelmente não é base64 válido):', err);
      setError(
        'Não foi possível exibir o PDF.\n\n' +
        'O conteúdo recebido não é um base64 válido ou está corrompido.\n' +
        'Tamanho recebido: ' + content.length + ' caracteres.\n'
      );
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [content]);

  if (error) {
    return (
      <View style={inlineStyle_61_12({
        height: height,
      })}>
        <Icon name="error-outline" size={64} color="red" />
        <Text style={inlineStyle_63_14}>
          {error}
        </Text>
      </View>
    );
  }

  if (!pdfUrl) {
    return (
      <View style={inlineStyle_72_12({
        height: height,
      })}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={inlineStyle_74_14}>
          Preparando visualização do PDF...
        </Text>
      </View>
    );
  }

  return (
    <View style={inlineStyle_82_10({
      height: height,
    })}>
      <iframe
        title="pdf-viewer"
        src={pdfUrl}
        style={inlineStyle_86_8}
      />
    </View>
  );
};

const MinutaTab = ({ contract, fileContent, fileLoading, fileError, canEdit, handleSignContract }) => {
  const isHTML = fileContent?.trim?.().startsWith?.('<') ?? false;
  const contractDocumentLabel =
    contract?.status?.realStatus === 'closed'
      ? global.t?.t('contract', 'label', 'contract')
      : global.t?.t('contract', 'label', 'draft');
  const loadingDocumentLabel = contractDocumentLabel || 'documento';

  return (
    <View style={inlineStyle_101_10}>
      <ScrollView
        style={styles.tabScroll}
        contentContainerStyle={inlineStyle_128_8({
          canEdit: canEdit,
        })}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{contractDocumentLabel}</Text>

          {fileLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{`Carregando ${loadingDocumentLabel}...`}</Text>
            </View>
          ) : fileError ? (
            <Text style={styles.errorText}>{fileError}</Text>
          ) : fileContent ? (
            <View style={styles.htmlWrapper}>
              {isHTML ? (
                <RenderHTML
                  contentWidth={width - 32}
                  source={{ html: fileContent }}
                  ignoredDomTags={['meta', 'title']}
                  baseStyle={inlineStyle_149_18}
                />
              ) : Platform.OS === 'web' ? (
                <PdfViewerFromContent content={fileContent} />
              ) : (
                <View style={styles.centerContainer}>
                  <Icon name="picture-as-pdf" size={64} color={colors.primary} />
                  <Text style={styles.loadingText}>PDF não suportado inline no mobile</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{`Gerando ${loadingDocumentLabel}...`}</Text>
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
    <ScrollView style={styles.tabScroll} contentContainerStyle={inlineStyle_192_41}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{global.t?.t('contract', 'label', 'signatories')}</Text>

        {subscribers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="people" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>{global.t?.t('contract', 'label', 'noSignatories')}</Text>
          </View>
        ) : (
          subscribers.map((sub) => (
            <View key={sub.id} style={styles.subscriberCard}>
              <View style={styles.subscriberAvatar}>
                <Icon name="person" size={24} color="#fff" />
              </View>
              <View style={inlineStyle_184_20}>
                <Text style={styles.subscriberName}>{sub.people?.name || global.t?.t('contract', 'label', 'nameNotAvailable')}</Text>
                <Text style={styles.subscriberRole}>{global.t?.t('contract', 'label', sub.peopleType)}</Text>
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
            <Text style={styles.addTitle}>{global.t?.t('contract', 'label', 'addSignatory')}</Text>

            <TouchableOpacity style={styles.selectField} onPress={() => setPeoplePickerVisible(true)}>
              <Icon name="person-outline" size={20} color={colors.primary} style={inlineStyle_202_75} />
              <Text style={inlineStyle_203_20({
                selectedPerson: selectedPerson,
              })}>
                {selectedPerson
                  ? people?.find((p) => p['@id'] === selectedPerson)?.name || global.t?.t('contract', 'label', 'selected')
                  : global.t?.t('contract', 'label', 'selectPerson')}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#64748b" />
            </TouchableOpacity>

            <View style={inlineStyle_211_18}>
              <Text style={styles.label}>{global.t?.t('contract', 'label', 'role')}</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, newSubscriberRole === 'Contractor' && styles.roleBtnActive]}
                  onPress={() => setNewSubscriberRole('Contractor')}>
                  <Text style={[styles.roleText, newSubscriberRole === 'Contractor' && { color: colors.primary }]}>
                    {global.t?.t('contract', 'label', 'contractor')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleBtn, newSubscriberRole === 'Witness' && styles.roleBtnActive]}
                  onPress={() => setNewSubscriberRole('Witness')}>
                  <Text style={[styles.roleText, newSubscriberRole === 'Witness' && { color: colors.primary }]}>
                    {global.t?.t('contract', 'label', 'witness')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, !selectedPerson && styles.addButtonDisabled]}
              disabled={!selectedPerson}
              onPress={handleAddSubscriber}>
              <Text style={styles.addButtonText}>{global.t?.t('contract', 'label', 'addSignatory')}</Text>
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
  const handleBackPress = () => {
    const backAction = resolveContractDetailsBackAction(navigation);

    if (backAction.type === 'history') {
      navigation.goBack();
      return;
    }

    navigation.navigate(backAction.routeName);
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
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
          const res = await contractActions.getFileContent(data.contractFile['@id']);
          setFileContent(res.content || '');
        } catch {
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
        const res = await contractActions.getFileContent(updated.contractFile['@id']);
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
        <View style={styles.topSkeleton} />
        <View style={styles.infoSkeleton} />
        <View style={styles.tabsSkeleton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.topAvatar}>
          <Icon name="description" size={32} color="#fff" />
        </View>
        <View style={inlineStyle_395_14}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {contract.contractModel?.model || 'Contrato sem modelo'}
          </Text>
          <Text style={styles.topSubtitle}>ID: {contract.id}</Text>
        </View>
      </View>
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
            {global.t?.t('contract', 'title', contract.status?.status).toUpperCase() || '—'}
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
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 0 && styles.tabActive]}
          onPress={() => handleTabPress(0)}>
          <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>
            {contract?.status?.realStatus === 'closed'
              ? global.t?.t('contract', 'label', 'contract')
              : global.t?.t('contract', 'label', 'draft')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 1 && styles.tabActive]}
          onPress={() => handleTabPress(1)}>
          <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>Produtos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 2 && styles.tabActive]}
          onPress={() => handleTabPress(2)}>
          <Text style={[styles.tabLabel, activeTab === 2 && styles.tabLabelActive]}>{global.t?.t('contract', 'label', 'signatories')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          if (idx !== activeTab) setActiveTab(idx);
        }}>
        <View style={inlineStyle_464_14({
          width: width,
        })}>
          <MinutaTab
            contract={contract}
            fileContent={fileContent}
            fileLoading={fileLoading}
            fileError={fileError}
            canEdit={canEdit}
            handleSignContract={handleSignContract}
          />
        </View>

        <View style={inlineStyle_475_14({
          width: width,
        })}>
          <LinkedOrderProductsTab
            contract={contract}
            canEdit={canEdit}
            emptyTitle="Nenhum produto vinculado a este contrato."
            emptySubtitle="Quando houver uma proposta anterior com produtos, eles serao copiados automaticamente para ca."
            searchPlaceholder="Buscar produto para adicionar ao contrato..."
          />
        </View>

        <View style={inlineStyle_485_14({
          width: width,
        })}>
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

export default ContractDetails;
