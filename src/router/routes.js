export const routes = [
  {
    path: "/contracts/",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/AdminLayout.vue"),
    children: [
      {
        name: "ContractIndex",
        path: "",
        component: () =>
          import("@controleonline/ui-contracts/src/pages/Contracts"),
      },
      {
        name: "contractDetails",
        path: "id/:id",
        component: () =>
          import(
            "@controleonline/ui-contracts/src/pages/Contracts/Details.vue"
          ),
      },
    ],
  },
  {
    path: "/contract/models/",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/AdminLayout.vue"),
    children: [
      {
        name: "model",
        path: "",
        component: () =>
          import("@controleonline/ui-contracts/src/pages/Model"),
      },
      {
        name: "modelDetails",
        path: "id/:id",
        component: () =>
          import(
            "@controleonline/ui-contracts/src/pages/Model/Details.vue"
          ),
      },
    ],
  },
];

export default routes;
