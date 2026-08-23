import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  buildContractProductsParams,
  buildContractDetailsParams,
} from './contractNavigation';
const {formatContractDate} = require('../utils/formatContractDate');

const ContractCard = ({
  contract,
  navigation,
  contractStyles,
  palette,
  getStatusColor,
  getStatusLabel,
  getContractClientName,
  isContractClientPendingResolution,
}) => {
  const clientName = getContractClientName(contract);
  const clientLabel = clientName
    ? clientName
    : isContractClientPendingResolution(contract)
      ? 'Carregando cliente...'
      : 'Cliente nao informado';

  return (
    <View style={contractStyles.contractCard}>
      <View style={contractStyles.contractHeader}>
        <View style={contractStyles.headerContent}>
          <Text style={contractStyles.contractTitle}>
            {contract.contractModel?.model || '—'}
          </Text>
          <View
            style={[
              contractStyles.statusBadge,
              { backgroundColor: getStatusColor(contract.status?.status) },
            ]}>
            <Text style={contractStyles.statusText}>
              {getStatusLabel(
                contract.status?.realStatus || contract.status?.status,
              ).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={contractStyles.contractBody}>
        <View style={contractStyles.infoRow}>
          <Icon name="user" size={16} color={palette.listItemIcon} />
          <Text style={contractStyles.infoLabel}>Cliente:</Text>
          <Text style={contractStyles.infoValue}>{clientLabel}</Text>
        </View>

        <View style={contractStyles.dateContainer}>
          <View style={contractStyles.dateItem}>
            <Icon name="calendar" size={16} color={palette.listItemIcon} />
            <Text style={contractStyles.dateLabel}>Início</Text>
            <Text style={contractStyles.dateValue}>
              {formatContractDate(contract.startDate)}
            </Text>
          </View>
          <View style={contractStyles.dateItem}>
            <Icon name="calendar" size={16} color={palette.listItemIcon} />
            <Text style={contractStyles.dateLabel}>Término</Text>
            <Text style={contractStyles.dateValue}>
              {formatContractDate(contract.endDate)}
            </Text>
          </View>
        </View>
      </View>

      <View style={contractStyles.cardActions}>
        <TouchableOpacity
          style={contractStyles.secondaryButton}
          onPress={() =>
            navigation.navigate(
              'ContractDetails',
              buildContractProductsParams(contract.id),
            )
          }>
          <Icon name="cube" size={16} color={palette.listItemIcon} />
          <Text style={contractStyles.secondaryButtonText}>Produtos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[contractStyles.viewButton, contractStyles.viewButtonInCard]}
          onPress={() =>
            navigation.navigate(
              'ContractDetails',
              buildContractDetailsParams(contract.id),
            )
          }>
          <Text style={contractStyles.viewButtonText}>Ver Detalhes</Text>
          <Icon name="arrow-right" size={16} color={palette.buttonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContractCard;
