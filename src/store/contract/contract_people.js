import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";

export default {
  namespaced: true,
  state: {
    resourceEndpoint: "contract_peoples",
    isLoading: false,
    error: "",
    violations: null,
    // totalItems: 0,
    filters: {},
    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: "id",
        align: "left",
        label: "id",
        externalFilter: true,
        to: function (value) {
          return {
            name: "contractDetails",
            params: { id: value },
          };
        },
        format: function (value) {
          return "#" + value;
        },
      },

    
    ],
  },
  actions,
  getters,
  mutations,
};
