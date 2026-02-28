import Contract from '@controleonline/ui-contracts/src/react/pages/ContractDetails';

const contractRoutes = [
  {
    name: 'ContractDetails',
    component: Contract,
    options: {
      headerShown: true,
      headerBackVisible: true,
      title: global.t?.t("ui-contracts", "title", "contract"),
    },
  },
  
];

export default contractRoutes;