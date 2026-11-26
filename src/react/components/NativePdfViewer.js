import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Pdf from 'react-native-pdf';

const {
  buildNativePdfSource,
  isRemotePdfUrl,
  normalizePdfContent,
} = require('../utils/nativePdfSource');

/**
 * Native (iOS/Android) PDF viewer using react-native-pdf.
 * Accepts pure base64 content from the API and builds a data: URI source.
 * Remote http(s) URLs are not rendered inline.
 */
const NativePdfViewer = ({content, palette, styles}) => {
  const normalizedContent = normalizePdfContent(content);
  const pdfSource = buildNativePdfSource(normalizedContent);
  const isUnsupportedRemotePdf = isRemotePdfUrl(normalizedContent);
  const [hasPdfError, setHasPdfError] = useState(false);

  useEffect(() => {
    setHasPdfError(false);
  }, [content]);

  if (!pdfSource && !isUnsupportedRemotePdf) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={64} color={palette.iconDanger} />
        <Text style={styles.errorText}>Nenhum conteúdo de PDF recebido</Text>
      </View>
    );
  }

  if (isUnsupportedRemotePdf || hasPdfError) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={64} color={palette.iconDanger} />
        <Text style={styles.errorText}>
          Não foi possível exibir o PDF neste dispositivo.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.nativePdfContainer}>
      <Pdf
        source={pdfSource}
        style={styles.nativePdf}
        trustAllCerts={false}
        enablePaging
        renderActivityIndicator={() => (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={palette.loadingSpinner} />
            <Text style={styles.loadingText}>Carregando PDF...</Text>
          </View>
        )}
        onError={error => {
          console.log('Erro ao renderizar PDF no mobile', error);
          setHasPdfError(true);
        }}
      />
    </View>
  );
};

export default NativePdfViewer;
