import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";





export default {
  namespaced: true,
  state: {
    resourceEndpoint: "contracts",
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
        to: function (column) {
          return {
            name: "contractsDetails",
            params: { id: column.id },
          };
        },        
        format: function (value) {
          return "#" + value;
        },
      },
      {
        sortable: true,
        name: "creationDate",
        editable: false,
        label: "creationDate",
        align: "left",
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },
      {
        sortable: true,
        name: "alterDate",
        editable: false,
        label: "alterDate",
        align: "left",
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },      
      {
        sortable: true,
        name: "status",
        editable: false,
        label: "status",
        align: "left",
        format(value, column, row) {
          return value;
        },
      },
      {
        sortable: true,
        name: "contractParent",
        editable: false,
        label: "contractParent",
        align: "left",     
        format(value, column, row) {
          return value;
        },
      },
      {
        sortable: true,
        name: "startDate",
        editable: false,
        label: "startDate",
        align: "left",
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },  
      {
        sortable: true,
        name: "endDate",
        editable: false,
        label: "endDate",
        align: "left",
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },  
      
    ],
  },
  actions: actions,
  getters,
  mutations,
};
