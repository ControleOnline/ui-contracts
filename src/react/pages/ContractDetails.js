import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import { Text, View, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStores } from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHTML from 'react-native-render-html';
import AnimatedModal from '@controleonline/ui-common/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import LinkedOrderProductsTab from '@controleonline/ui-common/src/react/components/LinkedOrderProductsTab';
const { resolveContractDetailsBackAction } = require('../utils/contractDetailsNavigation');
const {formatContractDate} = require('../utils/formatContractDate');
import {createStyles} from './ContractDetails.styles';
import {
  buildContractsPalette,
  getContractsStatusColor,
} from '../theme/contractsTheme';
const { width, height } = Dimensions.get('window');

const PdfViewerFromContent = ({ content, palette, styles }) => {
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
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: height * 0.75,
          padding: 30,
        }}>
        <Icon name="error-outline" size={64} color={palette.iconDanger} />
        <Text style={[styles.errorText, {marginTop: 16, lineHeight: 24}]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!pdfUrl) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: height * 0.75,
        }}>
        <ActivityIndicator size="large" color={palette.loadingSpinner} />
        <Text style={styles.loadingText}>
          Preparando visualização do PDF...
        </Text>
      </View>
    );
  }

  return (
    <View style={{height: height * 0.75, width: '100%'}}>
      <iframe
        title="pdf-viewer"
        src={pdfUrl}
        style={{width: '100%', height: '100%', border: 'none'}}
      />
    </View>
  );
};

const MinutaTab = ({
  canEdit,
  contract,
  fileContent,
  fileError,
  fileLoading,
  handleSignContract,
  palette,
  styles,
}) => {
  const isHTML = fileContent?.trim?.().startsWith?.('<') ?? false;
  const contractDocumentLabel =
    contract?.status?.realStatus === 'closed'
      ? global.t?.t('contract', 'label', 'contract')
      : global.t?.t('contract', 'label', 'draft');
  const loadingDocumentLabel = contractDocumentLabel || 'documento';

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={styles.tabScroll}
        contentContainerStyle={{padding: 16, paddingBottom: canEdit ? 120 : 40}}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{contractDocumentLabel}</Text>

          {fileLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={palette.loadingSpinner} />
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
                  baseStyle={{color: palette.textSecondary, lineHeight: 24}}
                />
              ) : Platform.OS === 'web' ? (
                <PdfViewerFromContent
                  content={fileContent}
                  palette={palette}
                  styles={styles}
                />
              ) : (
                <View style={styles.centerContainer}>
                  <Icon name="picture-as-pdf" size={64} color={palette.iconInfo} />
                  <Text style={styles.loadingText}>PDF não suportado inline no mobile</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={palette.loadingSpinner} />
              <Text style={styles.loadingText}>{`Gerando ${loadingDocumentLabel}...`}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {canEdit && (
        <View style={styles.fixedSignButtonContainer}>
          <TouchableOpacity style={styles.signButton} onPress={handleSignContract}>
            <Icon name="edit" size={20} color={palette.buttonIcon} />
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
  palette,
  styles,
}) => {
  return (
    <ScrollView
      style={styles.tabScroll}
      contentContainerStyle={{padding: 16, paddingBottom: 100}}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{global.t?.t('contract', 'label', 'signatories')}</Text>

        {subscribers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="people" size={64} color={palette.iconDisabled} />
            <Text style={styles.emptyText}>{global.t?.t('contract', 'label', 'noSignatories')}</Text>
          </View>
        ) : (
          subscribers.map((sub) => (
            <View key={sub.id} style={styles.subscriberCard}>
              <View style={styles.subscriberAvatar}>
                <Icon name="person" size={24} color={palette.buttonIcon} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.subscriberName}>{sub.people?.name || global.t?.t('contract', 'label', 'nameNotAvailable')}</Text>
                <Text style={styles.subscriberRole}>{global.t?.t('contract', 'label', sub.peopleType)}</Text>
              </View>
              {canEdit && (
                <TouchableOpacity onPress={() => handleRemoveSubscriber(sub.id)}>
                  <Icon name="delete" size={24} color={palette.iconDanger} />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {canEdit && (
          <View style={styles.addForm}>
            <Text style={styles.addTitle}>{global.t?.t('contract', 'label', 'addSignatory')}</Text>

            <TouchableOpacity style={styles.selectField} onPress={() => setPeoplePickerVisible(true)}>
              <Icon
                name="person-outline"
                size={20}
                color={palette.iconInfo}
                style={{marginRight: 12}}
              />
              <Text
                style={{
                  flex: 1,
                  color: selectedPerson
                    ? palette.selectText
                    : palette.selectPlaceholderText,
                }}>
                {selectedPerson
                  ? people?.find((p) => p['@id'] === selectedPerson)?.name || global.t?.t('contract', 'label', 'selected')
                  : global.t?.t('contract', 'label', 'selectPerson')}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={palette.selectIcon} />
            </TouchableOpacity>

            <View style={{marginVertical: 12}}>
              <Text style={styles.label}>{global.t?.t('contract', 'label', 'role')}</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, newSubscriberRole === 'Contractor' && styles.roleBtnActive]}
                  onPress={() => setNewSubscriberRole('Contractor')}>
                  <Text
                    style={[
                      styles.roleText,
                      newSubscriberRole === 'Contractor' && {
                        color: palette.navigationActiveText,
                      },
                    ]}>
                    {global.t?.t('contract', 'label', 'contractor')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleBtn, newSubscriberRole === 'Witness' && styles.roleBtnActive]}
                  onPress={() => setNewSubscriberRole('Witness')}>
                  <Text
                    style={[
                      styles.roleText,
                      newSubscriberRole === 'Witness' && {
                        color: palette.navigationActiveText,
                      },
                    ]}>
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
  const themeStore = useStores((s) => s.theme);
  const themeColors = themeStore?.getters?.colors || {};
  const palette = useMemo(() => buildContractsPalette(themeColors), [themeColors]);
  const styles = useMemo(() => createStyles(palette), [palette]);

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
  const contractStatusColor = getContractsStatusColor(
    palette,
    contract?.status?.realStatus || contract?.status?.status,
  );

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
          <Icon
            name="arrow-back"
            size={24}
            color={palette.navigationActiveIcon}
          />
        </TouchableOpacity>
        <View style={styles.topAvatar}>
          <Icon name="description" size={32} color={palette.buttonIcon} />
        </View>
        <View style={{flex: 1}}>
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
              borderColor: contractStatusColor,
            },
          ]}>
          <Text style={[styles.statusText, { color: contractStatusColor }]}>
            {global.t?.t('contract', 'title', contract.status?.status).toUpperCase() || '—'}
          </Text>
        </View>

        <View style={styles.datesRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Início</Text>
            <Text style={styles.dateValue}>
              {formatContractDate(contract.startDate)}
            </Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Término</Text>
            <Text style={styles.dateValue}>
              {formatContractDate(contract.endDate)}
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
        <View style={{width, flex: 1}}>
          <MinutaTab
            contract={contract}
            fileContent={fileContent}
            fileLoading={fileLoading}
            fileError={fileError}
            canEdit={canEdit}
            handleSignContract={handleSignContract}
            palette={palette}
            styles={styles}
          />
        </View>

        <View style={{width, flex: 1}}>
          <LinkedOrderProductsTab
            contract={contract}
            canEdit={canEdit}
            emptyTitle="Nenhum produto vinculado a este contrato."
            emptySubtitle="Quando houver uma proposta anterior com produtos, eles serao copiados automaticamente para ca."
            searchPlaceholder="Buscar produto para adicionar ao contrato..."
          />
        </View>

        <View style={{width, flex: 1}}>
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
            palette={palette}
            styles={styles}
          />
        </View>
      </ScrollView>
      <AnimatedModal visible={peoplePickerVisible} onRequestClose={() => setPeoplePickerVisible(false)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Pessoa</Text>
            <TouchableOpacity onPress={() => setPeoplePickerVisible(false)}>
              <Icon name="close" size={28} color={palette.modalCloseIcon} />
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
                  <Icon
                    name="check-circle"
                    size={24}
                    color={palette.iconSuccess}
                  />
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
