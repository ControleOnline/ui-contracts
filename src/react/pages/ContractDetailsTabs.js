import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHTML from 'react-native-render-html';

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


export { PdfViewerFromContent, MinutaTab, AssinantesTab };
