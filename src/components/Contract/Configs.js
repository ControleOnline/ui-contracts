import getModelConfigs from "@controleonline/ui-crm/src/components/Model/Configs";

export default function getConfigs(context, myCompany, $components, $store) {
  return {
    externalFilters: false,
    store: "contract",
    status: [context],
    add: true,
    delete: true,
    filters: true,
    selection: false,
    search: false,
    columns: {
      model: getModelConfigs(
        context,
        myCompany,
        $components,
        $store
      ),
      status: {
        filters: {
          context: context,
          company: "/people/" + myCompany.id,
        },
      },
    },
  };
}
