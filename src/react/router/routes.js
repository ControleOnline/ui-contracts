import Contract from '@controleonline/ui-contracts/src/react/pages/ContractDetails';
import CrmLayout from '@controleonline/ui-layout/src/react/layouts/CrmLayout';

import React from 'react';

const WrappedClient = ({navigation, route}) => (
  <CrmLayout navigation={navigation} route={route}>
    <Contract navigation={navigation} route={route} />
  </CrmLayout>
);
const contractRoutes = [
  {
    name: 'ContractDetails',
    component: WrappedClient,
    options: {
      headerShown: false,
      title: 'Contrato',
      headerBackButtonMenuEnabled: false,
    },
  },
  
];

export default contractRoutes;
