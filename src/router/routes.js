export const routes = [{
    path: '/contracts/',
    component: () =>  import ('@controleonline/ui-layout/src/layouts/AdminLayout.vue'),
    children: [
      {
        name: 'ContractIndex',
        path: '',
        component: () =>  import ('@controleonline/ui-contracts/src/pages/Config/Menu.vue'),
      },    

      
    ]
  }];
  
  export default routes
  