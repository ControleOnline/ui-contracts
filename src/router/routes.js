export const routes = [{
    path: '/contracts/',
    component: () =>  import ('@controleonline/ui-layout/src/layouts/AdminLayout.vue'),
    children: [
      {
        name: 'ContractIndex',
        path: '',
        component: () =>  import ('@controleonline/ui-contracts/src/pages/Menu.vue'),
      },    
      {
        name: "contractDetails",
        path: "id/:id",
        component: () => import("@controleonline/ui-contracts/src/pages/Details.vue"),
      }      
    ]
  }];
  
  export default routes
  