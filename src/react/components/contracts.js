import React, {useCallback} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {getStore} from '@store';
import StateStore from '@controleonline/ui-layout/src/react/components/StateStore';
import css from '@controleonline/ui-orders/src/react/css/orders';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Contracts = ({client}) => {
  const {styles, globalStyles} = css();
  const {getters: contractGetters, actions: contractActions} =
    getStore('contract');
  const {items: contracts, isLoading, error} = contractGetters;
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      contractActions.getItems({
        beneficiary: client.id,
        'contractModel.context': 'contract',
      });
    }, [client]),
  );

  const renderContract = contract => (
    <TouchableOpacity
      key={contract.id}
      style={[
        styles.contractItem,
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          padding: 16,
          marginVertical: 8,
          marginHorizontal: 16,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      ]}
      onPress={() =>
        navigation.navigate('ContractDetails', {contractId: contract.id})
      }>
      <View style={[styles.contractContainer, {flexDirection: 'column'}]}>
        <Text
          style={[
            styles.contractTitle,
            {
              color: '#000000',
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 8,
            },
          ]}>
          {contract.contractModel.model}
        </Text>
        <Text
          style={[styles.contractDetail, {color: '#000000', marginBottom: 4}]}>
          Beneficiário: {contract.beneficiary.name}
        </Text>
        <Text
          style={[styles.contractDetail, {color: '#000000', marginBottom: 4}]}>
          Status: {contract.status.status}
        </Text>
        <Text
          style={[styles.contractDetail, {color: '#000000', marginBottom: 4}]}>
          Data de Início:{' '}
          {new Date(contract.startDate).toLocaleDateString('pt-BR')}
        </Text>
        <Text
          style={[styles.contractDetail, {color: '#000000', marginBottom: 4}]}>
          Data de Término:{' '}
          {new Date(contract.endDate).toLocaleDateString('pt-BR')}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#2529a1',
            padding: 10,
            borderRadius: 4,
            marginTop: 8,
            alignItems: 'center',
          }}
          onPress={() =>
            navigation.navigate('ContractDetails', {contractId: contract.id})
          }>
          <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>
            Ver Contrato
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[globalStyles.container, {backgroundColor: '#F5F5F5'}]}>
      <Text
        style={[
          globalStyles.title,
          {color: '#000000', fontSize: 24, fontWeight: 'bold', margin: 16},
        ]}>
        Contratos
      </Text>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2529a1"
          style={{marginTop: 20}}
        />
      ) : error ? (
        <Text
          style={[
            globalStyles.errorText,
            {color: '#000000', textAlign: 'center', marginTop: 20},
          ]}>
          Erro: {error}
        </Text>
      ) : contracts.length === 0 ? (
        <Text
          style={[
            globalStyles.noDataText,
            {color: '#000000', textAlign: 'center', marginTop: 20},
          ]}>
          Nenhum contrato encontrado.
        </Text>
      ) : (
        <ScrollView>{contracts.map(renderContract)}</ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Contracts;
