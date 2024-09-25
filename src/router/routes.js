export const routes = [{
    path: '/contracts/',
    component: () =>  import ('@controleonline/ui-layout/src/layouts/AdminLayout.vue'),
    children: [
      {
        name: 'ContractIndex',
        path: '',
        component: () =>  import ('@controleonline/ui-contracts/src/pages/Contracts'),
      },    
      {
        name: "contractDetails",
        path: "id/:id",
        component: () => import("@controleonline/ui-contracts/src/pages/Contracts/Details.vue"),
      }      
    ]
  }];
  
  export default routes
  