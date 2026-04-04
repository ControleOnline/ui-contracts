import getModelConfigs from "@controleonline/ui-crm/src/vue/components/Model/Configs";

export default function getConfigs(context, myCompany, $components, $store) {
  return {
    externalFilters: false,
    store: "contract",
    status: [context],
    companyParam: "provider",
    add: true,
    delete: false,
    filters: true,
    selection: false,
    search: true,

    multiline: {
      people: {
        store: "contract_people",
        add: true,
        delete: true,
        title: {
          class: "text-primary text-h6 q-mb-md",
          icon: {
            name: "people",
            size: "24px",
            class: "q-mr-sm",
          },
        },
        filters: {
          contract: "Contractor", // @todo // traduzir?
          company: "/contract/" + myCompany.id,
        },
        companyParam:false,
        selection: false,
        externalFilters: false,
        controls: false,
        search: false,
      },
    },
    columns: {
      contractModel: {
        filters: {
          context: context,
          company: "/people/" + myCompany.id,
        },
      },
      peoples: {
        filters: {
          people_type: "Contractor", // nunca traduzir
          company: "/people/" + myCompany.id,
        },
      },
      status: {
        filters: {
          context: context,
          company: "/people/" + myCompany.id,
        },
      },
    },
    components: {
      headerActions: [
        {
          component: $components.DefaultButtonDialog,
          props: {
            component: $components.DefaultTable,
          },
          configs: getModelConfigs(context, myCompany, $components, $store),
        },
      ],
    },
  };
}
