import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStores } from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHTML from 'react-native-render-html';
import AnimatedModal from '@controleonline/ui-common/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import LinkedOrderProductsTab from '@controleonline/ui-common/src/react/components/LinkedOrderProductsTab';
import DocumentDetailsShell from '@controleonline/ui-common/src/react/components/documentDetails/DocumentDetailsShell';
import DocumentSheet from '@controleonline/ui-common/src/react/components/documentDetails/DocumentSheet';
import useLinkedOrderSummary from '@controleonline/ui-common/src/react/hooks/useLinkedOrderSummary';
import { getPeopleDisplayName } from '@controleonline/ui-common/src/react/utils/peopleDisplay';
const { formatContractPeriod, formatContractStatusLabel, translatedOr } = require('../utils/contractHeader');
const contractLabel = (key, fallback) => translatedOr(global.t?.t('contract', 'label', key), key, fallback);
import { colors } from '@controleonline/../../src/styles/colors';
import { resolveDocumentFileContent } from '@controleonline/ui-common/src/react/utils/documentFileContent';
const { resolveContractDetailsBackAction } = require('../utils/contractDetailsNavigation');
import {createStyles} from './ContractDetails.styles';
import {
  buildContractsPalette,
  getContractsStatusColor,
} from '../theme/contractsTheme';

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
          height: '100%',
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
          height: '100%',
        }}>
        <ActivityIndicator size="large" color={palette.loadingSpinner} />
        <Text style={styles.loadingText}>
          Preparando visualização do PDF...
        </Text>
      </View>
    );
  }

  return (
    <View style={{height: '100%', width: '100%'}}>
      <iframe
        title="pdf-viewer"
        src={pdfUrl}
        style={{width: '100%', height: '100%', border: 'none'}}
      />
    </View>
  );
};


// Readable width of the document inside the "paper" (see DocumentDetailsShell).
const resolveDocumentWidth = width => (width >= 768 ? Math.min(width - 48, 920) - 80 : width - 32);

const ContractDocument = ({ document, fileError, palette, styles }) => {
  const { width } = useWindowDimensions();
  const fileContent = document?.content || '';

  if (fileError) {
    return <Text style={styles.errorText}>{fileError}</Text>;
  }
  if (!fileContent) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={palette.loadingSpinner} />
        <Text style={styles.loadingText}>Gerando minuta...</Text>
      </View>
    );
  }
  if (document.kind === 'text') {
    return (
      <Text selectable style={{color: palette.textSecondary, fontSize: 15, lineHeight: 24}}>
        {fileContent}
      </Text>
    );
  }
  if (document.kind === 'html') {
    return (
      <RenderHTML
        contentWidth={resolveDocumentWidth(width)}
        source={{ html: fileContent }}
        ignoredDomTags={['meta', 'title']}
        baseStyle={{color: palette.textSecondary, fontSize: 15, lineHeight: 24}}
      />
    );
  }
  if (Platform.OS === 'web') {
    return (
      <View style={{height: 720}}>
        <PdfViewerFromContent content={fileContent} palette={palette} styles={styles} />
      </View>
    );
  }
  return (
    <View style={styles.centerContainer}>
      <Icon name="picture-as-pdf" size={64} color={palette.iconInfo} />
      <Text style={styles.loadingText}>PDF não suportado inline no mobile</Text>
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
    <ScrollView contentContainerStyle={{paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24}}>
      <View>

        {subscribers.length === 0 ? (
          <View style={{alignItems: 'center', paddingVertical: 16}}>
            <Icon name="people" size={36} color={palette.iconDisabled} />
            <Text style={styles.emptyText}>{contractLabel('noSignatories', 'Nenhum assinante adicionado.')}</Text>
          </View>
        ) : (
          subscribers.map((sub) => (
            <View key={sub.id} style={styles.subscriberCard}>
              <View style={styles.subscriberAvatar}>
                <Icon name="person" size={24} color={palette.buttonIcon} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.subscriberName}>{sub.people?.name || contractLabel('nameNotAvailable', 'Nome não disponível')}</Text>
                <Text style={styles.subscriberRole}>{contractLabel(sub.peopleType, sub.peopleType === 'Witness' ? 'Testemunha' : 'Responsável - contratante')}</Text>
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
            <Text style={styles.addTitle}>{contractLabel('addSignatory', 'Adicionar assinante')}</Text>

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
                  ? people?.find((p) => p['@id'] === selectedPerson)?.name || contractLabel('selected', 'Selecionado')
                  : contractLabel('selectPerson', 'Selecionar pessoa')}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={palette.selectIcon} />
            </TouchableOpacity>

            <View style={{marginVertical: 12}}>
              <Text style={styles.label}>{contractLabel('role', 'Papel')}</Text>
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
                    {contractLabel('contractor', 'Responsável - contratante')}
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
                    {contractLabel('witness', 'Testemunha')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, !selectedPerson && styles.addButtonDisabled]}
              disabled={!selectedPerson}
              onPress={handleAddSubscriber}>
              <Text style={styles.addButtonText}>{contractLabel('addSignatory', 'Adicionar assinante')}</Text>
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
  const { contractId, initialTab } = route.params;

  const { showSuccess, showError, showWarning } = useMessage();

  const contractStore = useStores((s) => s.contract);
  const contractPeopleStore = useStores((s) => s.contract_peoples);
  const peopleStore = useStores((s) => s.people);
  const themeStore = useStores((s) => s.theme);
  const themeColors = themeStore?.getters?.colors || {};
  const palette = useMemo(() => buildContractsPalette(themeColors), [themeColors]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const documentTheme = useMemo(
    // Same brand primary as the proposal screen, so the main action stands out.
    () => ({ primary: colors.primary }),
    [],
  );

  const { item: contract, isLoading } = contractStore.getters;
  const contractActions = contractStore.actions;
  const contractPeopleActions = contractPeopleStore.actions;
  const peopleActions = peopleStore.actions;
  const { items: people, currentCompany } = peopleStore.getters;

  const [fileDocument, setFileDocument] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [newSubscriberRole, setNewSubscriberRole] = useState('Contractor');
  const [peoplePickerVisible, setPeoplePickerVisible] = useState(false);
  const [productsOpen, setProductsOpen] = useState(String(initialTab || '').toLowerCase() === 'products');
  const [signersOpen, setSignersOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  const orderSummary = useLinkedOrderSummary(contract?.['@id']);
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

  const loadDocument = useCallback(async (regenerate = false) => {
    setFileLoading(true);
    try {
      if (regenerate) {
        await contractActions.generate({ id: contractId });
      }
      let data = await contractActions.get(contractId);
      if (!data?.contractFile) {
        await contractActions.generate({ id: contractId });
        data = await contractActions.get(contractId);
      }
      if (data?.contractFile) {
        const res = await contractActions.getFileContent(data.contractFile['@id']);
        setFileDocument(resolveDocumentFileContent(res?.content));
        setFileError(null);
      }
      return data;
    } catch {
      setFileError('Não foi possível carregar a minuta.');
      return null;
    } finally {
      setFileLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    const loadData = async () => {
      const data = await loadDocument();

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
    if (subscribers.length === 0) {
      showWarning('Adicione pelo menos um assinante antes de assinar.');
      setSignersOpen(true);
      return;
    }
    setSigning(true);
    try {
      await contractActions.sign({ id: contractId });
      showSuccess('Contrato enviado para assinatura');
      await loadDocument();
    } catch {
      showError('Erro ao assinar o contrato');
    } finally {
      setSigning(false);
    }
  };

  // The draft is rendered from the order products; regenerate it after they change.
  const handleProductsChanged = async () => {
    await Promise.all([orderSummary.reload(), loadDocument(true)]);
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

  const statusLabel = contract
    ? formatContractStatusLabel(contract.status, global.t?.t('contract', 'title', contract.status?.status))
    : null;
  const signersLabel = contractLabel('signatories', 'Assinantes');

  return (
    <>
      <DocumentDetailsShell
        theme={documentTheme}
        title={contract?.contractModel?.model || 'Contrato'}
        clientName={getPeopleDisplayName(contract?.client)}
        meta={
          contract
            ? [`#${contract.id}`, formatContractPeriod(contract.startDate, contract.endDate)]
                .filter(Boolean)
                .join('  ·  ')
            : ''
        }
        totalLabel={orderSummary.totalLabel}
        statusLabel={statusLabel}
        statusColor={contractStatusColor}
        onBack={handleBackPress}
        loading={isLoading || !contract || (fileLoading && !fileDocument)}
        secondaryActions={[
          {
            key: 'products',
            icon: 'inventory-2',
            label: 'Produtos',
            count: orderSummary.count,
            onPress: () => setProductsOpen(true),
          },
          {
            key: 'signers',
            icon: 'groups',
            label: signersLabel,
            count: subscribers.length,
            onPress: () => setSignersOpen(true),
          },
        ]}
        primaryAction={
          canEdit
            ? { label: 'Assinar contrato', icon: 'draw', onPress: handleSignContract, loading: signing }
            : null
        }>
        <ContractDocument
          document={fileDocument}
          fileError={fileError}
          palette={palette}
          styles={styles}
        />
      </DocumentDetailsShell>

      <DocumentSheet
        visible={productsOpen}
        onClose={() => setProductsOpen(false)}
        theme={documentTheme}
        title="Produtos do contrato"
        subtitle={
          orderSummary.count
            ? `${orderSummary.count} ${orderSummary.count === 1 ? 'item' : 'itens'} · ${orderSummary.totalLabel}`
            : 'Nenhum produto ainda'
        }>
        {contract ? (
          <LinkedOrderProductsTab
            contract={contract}
            canEdit={canEdit}
            emptyTitle="Nenhum produto vinculado a este contrato."
            emptySubtitle="Adicione os produtos negociados; a minuta é atualizada automaticamente."
            searchPlaceholder="Buscar produto para adicionar..."
            onProductsChanged={handleProductsChanged}
            embedded
          />
        ) : null}
      </DocumentSheet>

      <DocumentSheet
        visible={signersOpen}
        onClose={() => setSignersOpen(false)}
        theme={documentTheme}
        title={signersLabel}
        subtitle={
          subscribers.length
            ? `${subscribers.length} ${subscribers.length === 1 ? 'assinante' : 'assinantes'}`
            : 'Nenhum assinante ainda'
        }>
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
      </DocumentSheet>

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
    </>
  );
};

export default ContractDetails;
