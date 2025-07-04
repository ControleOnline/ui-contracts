import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getStore } from '@store';
import css from '@controleonline/ui-orders/src/react/css/orders';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker'; // Correct import for Picker

const ContractDetails = () => {
  const { styles, globalStyles } = css();
  const { getters: contractGetters, actions: contractActions } = getStore('contract');
  const { item: contract, isLoading, error } = contractGetters;
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [newSubscriberName, setNewSubscriberName] = useState('');
  const [newSubscriberRole, setNewSubscriberRole] = useState('Contractor');
  const [subscribers, setSubscribers] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();
  const { contractId } = route.params;

  useEffect(() => {
    contractActions.get(contractId).then(d => {
      console.log('Contract Data:', d);
      if (d.contractFile) {
        fetchContractFile(d.contractFile['@id']);
      }
      if (d.peoples) {
        setSubscribers(d.peoples); // Load peoples array as subscribers
      }
    });
  }, [contractId]);

  const fetchContractFile = async fileId => {
    setFileLoading(true);
    setFileError(null);
    try {
      const response = await contractActions.getFileAsHtml(fileId);
      console.log(response);
      setFileContent(response.html || '');
    } catch (err) {
      setFileError('Erro ao carregar o conteúdo HTML do contrato.');
    } finally {
      setFileLoading(false);
    }
  };

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
    console.log(`Iniciar processo de assinatura para o contrato ${contractId}`);
  };

  const handleAddSubscriber = async () => {
    if (newSubscriberName.trim() === '') {
      alert('Por favor, insira o nome do assinante.');
      return;
    }
    try {
      // Assuming contractActions.addSubscriber creates a new ContractPeople entry
      const newSub = await contractActions.addSubscriber(contractId, {
        name: newSubscriberName,
        peopleType: newSubscriberRole,
      });
      setSubscribers([...subscribers, newSub]);
      setNewSubscriberName('');
      setNewSubscriberRole('Contractor');
      alert('Assinante adicionado com sucesso!');
    } catch (err) {
      alert('Erro ao adicionar assinante.');
    }
  };

  const handleRemoveSubscriber = async (subscriberId) => {
    try {
      // Assuming contractActions.removeSubscriber removes a ContractPeople entry
      await contractActions.removeSubscriber(contractId, subscriberId);
      setSubscribers(subscribers.filter(sub => sub.id !== subscriberId));
      alert('Assinante removido com sucesso!');
    } catch (err) {
      alert('Erro ao remover assinante.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[globalStyles.container, { backgroundColor: '#F5F5F5' }]}>
        <ActivityIndicator size="large" color="#2529a1" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (error || !contract) {
    return (
      <SafeAreaView style={[globalStyles.container, { backgroundColor: '#F5F5F5' }]}>
        <Text style={[globalStyles.errorText, { color: '#000000', textAlign: 'center', marginTop: 20 }]}>
          {error || 'Contrato não encontrado.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: '#F5F5F5' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={[globalStyles.title, { color: '#000000', fontSize: 24, fontWeight: 'bold', marginLeft: 16 }]}>
          Detalhes do Contrato
        </Text>
      </View>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={[styles.contractTitle, { color: '#000000', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }]}>
            {contract.contractModel?.model}
          </Text>
          <Text style={[styles.contractDetail, { color: '#000000', marginBottom: 8 }]}>
            Beneficiário: {contract.beneficiary?.name}
          </Text>
          <Text style={[styles.contractDetail, { color: '#000000', marginBottom: 8 }]}>
            Status: {contract.status?.status}
          </Text>
          <Text style={[styles.contractDetail, { color: '#000000', marginBottom: 8 }]}>
            Data de Início: {new Date(contract?.startDate).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={[styles.contractDetail, { color: '#000000', marginBottom: 8 }]}>
            Data de Término: {new Date(contract?.endDate).toLocaleDateString('pt-BR')}
          </Text>
          {/* Subscribers Section */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.contractDetail, { color: '#000000', fontWeight: 'bold', marginBottom: 8 }]}>
              Assinantes:
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: '#CCCCCC',
                  borderRadius: 4,
                  padding: 8,
                  color: '#000000',
                }}
                value={newSubscriberName}
                onChangeText={setNewSubscriberName}
                placeholder="Nome do novo assinante"
              />
              <Picker
                selectedValue={newSubscriberRole}
                style={{ width: 150, marginLeft: 8 }}
                onValueChange={(itemValue) => setNewSubscriberRole(itemValue)}
              >
                <Picker.Item label="Contractor" value="Contractor" />
                <Picker.Item label="Witness" value="Witness" />
              </Picker>
              <TouchableOpacity
                style={{
                  backgroundColor: '#2529a1',
                  padding: 12,
                  borderRadius: 4,
                  marginLeft: 8,
                  alignItems: 'center',
                }}
                onPress={handleAddSubscriber}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Adicionar</Text>
              </TouchableOpacity>
            </View>
            {subscribers.length === 0 ? (
              <Text style={{ color: '#000000', marginBottom: 8 }}>Nenhum assinante adicionado.</Text>
            ) : (
              subscribers.map(subscriber => (
                <View key={subscriber.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ flex: 1, color: '#000000' }}>
                    {subscriber.people.name} ({subscriber.peopleType})
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF0000',
                      padding: 8,
                      borderRadius: 4,
                    }}
                    onPress={() => handleRemoveSubscriber(subscriber.id)}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
          {contract.contractFile && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.contractDetail, { color: '#000000', fontWeight: 'bold', marginBottom: 8 }]}>
                Conteúdo do Contrato (Editável):
              </Text>
              {fileLoading && (
                <ActivityIndicator size="small" color="#2529a1" style={{ marginVertical: 8 }} />
              )}
              {fileError && (
                <Text style={[globalStyles.errorText, { color: '#FF0000', marginBottom: 8 }]}>
                  {fileError}
                </Text>
              )}
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#CCCCCC',
                  borderRadius: 4,
                  padding: 8,
                  color: '#000000',
                  minHeight: 200,
                  marginBottom: 16,
                  textAlignVertical: 'top',
                  fontFamily: 'monospace',
                }}
                multiline
                value={fileContent}
                onChangeText={setFileContent}
                placeholder="Conteúdo HTML do contrato..."
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#2529a1',
                  padding: 12,
                  borderRadius: 4,
                  marginBottom: 16,
                  alignItems: 'center',
                }}
                onPress={handleSaveContent}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={{
              backgroundColor: '#2529a1',
              padding: 12,
              borderRadius: 4,
              marginTop: 16,
              alignItems: 'center',
            }}
            onPress={handleSignContract}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Assinar Contrato</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContractDetails;