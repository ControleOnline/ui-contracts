import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";



// "name": "people",
// "color": "$primary",
// "icon": "",
// "description": null


export default {
  namespaced: true,
  state: {
    resourceEndpoint: "contracts",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    columns: [
      {
        sortable: true,
        isIdentity: true,        
        name: "id",
        editable: false,
        label: "id",
        align: "left",
        // format(value, column, row) {
        //   return value;
        // },
      },
      {
        sortable: true,
        name: "menu",
        editable: true,
        label: "menu",
        align: "left",
        format(value, column, row) {
          return value;
        },        
      },
      {
        sortable: true,
        name: "category",
        align: "left",
        label: "category",
        list: "categories/getItems",
        searchParam: "name",
        externalFilter: true,
        format: function (value) {
          return value?.name;
        },
        style: function (value) {
          return {
            color: value?.category?.color,
          };
        },
        saveFormat: function (value, column, row) {
          //if (row && row["@id"])
          return "/categories/" + parseInt(value.value || value);
          //else return parseInt(value.value || value);
        },
        formatList: function (value) {
          return value
            ? {
                label: value?.name,
                value: value?.id,
              }
            : null;
        },
      },      
      {
        sortable: true,
        name: "color",
        editable: true,
        label: "color",
        align: "left",
      },   
      {
        sortable: true,
        name: "icon",
        editable: true,
        label: "icon",
        align: "left",
      },        
      {
        sortable: true,
        name: "route",
        align: "left",
        label: "route",
        list: "routes/getItems",
        searchParam: "route",
        externalFilter: true,
        format: function (value) {
          return value?.name;
        },
        style: function (value) {
          return {
            color: value?.category?.color,
          };
        },
        saveFormat: function (value, column, row) {
          //if (row && row["@id"])
          return "/routes/" + parseInt(value.value || value);
          //else return parseInt(value.value || value);
        },
        formatList: function (value) {
          console.log(value);
          return value
            ? {
                label: value?.route,
                value: value?.id,
              }
            : null;
        },
      },    
        ],
  },
  actions: actions,
  getters,
  mutations,
};
