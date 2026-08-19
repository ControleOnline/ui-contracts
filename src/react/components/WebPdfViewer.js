import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {height} = Dimensions.get('window');

/**
 * Web-only PDF viewer: decodes pure base64 content into a blob URL and renders via iframe.
 * Not used on native (Platform.OS !== 'web').
 */
const WebPdfViewer = ({content, palette, styles}) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!content || content.length === 0) {
      setError('Nenhum conteúdo de PDF recebido');
      return;
    }

    let url = null;

    try {
      const byteCharacters = atob(content);
      const byteNumbers = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteNumbers], {type: 'application/pdf'});
      url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Erro ao processar PDF (provavelmente não é base64 válido):', err);
      setError(
        'Não foi possível exibir o PDF.\n\n' +
          'O conteúdo recebido não é um base64 válido ou está corrompido.\n' +
          'Tamanho recebido: ' +
          content.length +
          ' caracteres.\n',
      );
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
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
        <Text style={[styles.errorText, {marginTop: 16, lineHeight: 24}]}>{error}</Text>
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
        <Text style={styles.loadingText}>Preparando visualização do PDF...</Text>
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

export default WebPdfViewer;
