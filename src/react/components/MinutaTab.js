import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHTML from 'react-native-render-html';
import WebPdfViewer from './WebPdfViewer';
import NativePdfViewer from './NativePdfViewer';

const {width} = Dimensions.get('window');

/**
 * Tab that renders the contract/proposal draft (HTML or PDF).
 * On web uses iframe blob viewer; on native uses react-native-pdf.
 */
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
                  source={{html: fileContent}}
                  ignoredDomTags={['meta', 'title']}
                  baseStyle={{color: palette.textSecondary, lineHeight: 24}}
                />
              ) : Platform.OS === 'web' ? (
                <WebPdfViewer
                  content={fileContent}
                  palette={palette}
                  styles={styles}
                />
              ) : (
                <NativePdfViewer
                  content={fileContent}
                  palette={palette}
                  styles={styles}
                />
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

export default MinutaTab;
