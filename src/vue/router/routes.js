export const routes = [
  {
    path: "/contracts/",
    component: () =>
      import("@controleonline/ui-layout/src/vue/layouts/AdminLayout.vue"),
    children: [
      {
        name: "ContractIndex",
        path: "",
        component: () =>
          import("@controleonline/ui-contracts/src/vue/pages/Contracts"),
      },
      {
        name: "contractDetails",
        path: "id/:id",
        component: () =>
          import(
            "@controleonline/ui-contracts/src/vue/pages/Contracts/Details.vue"
          ),
      },
    ],
  },
  {
    path: "/contract/models/",
    component: () =>
      import("@controleonline/ui-layout/src/vue/layouts/AdminLayout.vue"),
    children: [
      {
        name: "model",
        path: "",
        component: () =>
          import("@controleonline/ui-contracts/src/vue/pages/Model"),
      },
      {
        name: "modelDetails",
        path: "id/:id",
        component: () =>
          import(
            "@controleonline/ui-contracts/src/vue/pages/Model/Details.vue"
          ),
      },
    ],
  },
];

export default routes;
