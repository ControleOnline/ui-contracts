import Contract from '@controleonline/ui-contracts/src/react/pages/ContractDetails';
import { env } from '@env';

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

];

export default contractRoutes;
