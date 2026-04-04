import Contract from '@controleonline/ui-contracts/src/react/pages/ContractDetails';
import ContractsPage from '@controleonline/ui-contracts/src/react/pages/ContractsPage';

const contractRoutes = [
  {
    name: 'ContractDetails',
    component: Contract,
    options: {
      headerShown: true,
      headerBackVisible: true,
      title: global.t?.t("ui-contracts", "title", "contract"),
      showBottomToolBar: true,
    },
  },
  {
    name: 'ContractsIndex',
    component: ContractsPage,
    options: {
      showCompanyFilter: true,
      showBottomToolBar: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: global.t?.t("ui-contracts", "title", "contracts"),
    },
  },
];

export default contractRoutes;