import DefaultButtonDialog from "@controleonline/ui-default/src/components/Default/DefaultButtonDialog";
import getModelConfigs from "@controleonline/ui-crm/src/components/Model/Configs";

export default function getConfigs(context, myCompany, $components, $store) {
  return {
    externalFilters: true,
    store: "contract",
    status: [context],
    companyParam: "beneficiary",
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
          contract: "Contractor",
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
          people_type: "Contractor",
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
          component: DefaultButtonDialog,
          props: {
            component: $components.DefaultTable,
          },
          configs: getModelConfigs(context, myCompany, $components, $store),
        },
      ],
    },
  };
}
