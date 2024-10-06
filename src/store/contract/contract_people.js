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
        label: "people",
        list: "people/getItems",
        externalFilter: false,
        format: function (value) {
          return value ? value?.name + " - " + value?.alias : " - ";
        },
        formatList: function (value) {
          if (value)
            return {
              value: value["@id"].split("/").pop(),
              label: value?.name + " - " + value?.alias,
            };
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
        label: "peopleType",
        externalFilter: true,
        list: [
          { value: "Beneficiary", label: "Beneficiary" },
          { value: "Contractor", label: "Contractor" },
          { value: "Witness", label: "Witness" },
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
