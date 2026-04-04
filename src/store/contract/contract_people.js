import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";

export default {
  namespaced: true,
  state: {
 item:{},
items:[],
    resourceEndpoint: "contract_peoples",
    isLoading: false,
    error: "",
    violations: null,
    // totalItems: 0,
    summary: {},
    filters: {},
    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: "id",
        align: "left",
        label: global.t?.t('contract', 'label', 'id'),
        externalFilter: false,
        to: function (value, column, row) {
          return {
            name: "CustomersDetails",
            params: { id: row.people.id },
          };
        },
        format: function (value, column, row) {
          return "#" + row?.people?.id;
        },
      },

      {
        sortable: true,
        name: "people",
        align: "left",
        label: global.t?.t('contract', 'label', 'people'),
        list: "people/getItems",
        externalFilter: false,
        format: function (value) {
          return value ? value?.name + " - " + value?.alias : " - ";
        },
        saveFormat: function (value) {
          return value ? "/people/" + (value.value || value) : null;
        },
      },
      {
        editable: true,
        sortable: true,
        name: "peopleType",
        align: "left",
        label: global.t?.t('contract', 'label', 'role'),
        externalFilter: false,
        list: [
          { value: "Provider", label: global.t?.t('contract', 'label', 'provider') },
          { value: "Contractor", label: global.t?.t('contract', 'label', 'contractor') },
          { value: "Witness", label: global.t?.t('contract', 'label', 'witness') },
        ],
        format: function (value) {
          return value;
        },
      },
    ],
  },
  actions,
  getters,
  mutations,
};
