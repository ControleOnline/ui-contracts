import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";
import * as customActions from "./actions";

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

      {
        sortable: true,
        name: "peoples",
        editable: true,
        label: "peoples",
        align: "left",
        externalFilter: true,
        multiline: true,
        add: true,
        format: function (value, column, row) {
          let peoples = [];
          row.peoples.forEach((people, i) => {
            if (people.peopleType == "Contractor")
              peoples.push(people.people.name);
          });
          return peoples;
        },
      },
      {
        sortable: true,
        name: "contractModel",
        editable: true,
        label: "contractModel",
        align: "left",
        list: "model/getItems",
        searchParam: "model",
        externalFilter: true,
        format: function (value) {
          return value?.model;
        },
        formatList: function (value) {
          if (value)
            return {
              value: value["@id"].split("/").pop(),
              label: value?.model,
            };
        },
        saveFormat: function (value) {
          return value ? "/models/" + (value?.value || value) : null;
        },
      },
      {
        sortable: true,
        name: "status",
        align: "left",
        label: "status",
        list: "status/getItems",
        searchParam: "status",
        externalFilter: true,
        format: function (value) {
          return value?.status;
        },
        style: function (value) {
          return {
            color: value?.status?.color,
          };
        },
        formatList: function (value) {
          if (value)
            return {
              value: value["@id"].split("/").pop(),
              label: value?.status,
            };
        },
        saveFormat: function (value) {
          return value ? "/statuses/" + (value?.value || value) : null;
        },
      },
      {
        sortable: true,
        name: "creationDate",
        editable: false,
        add: false,
        label: "creationDate",
        inputType: "date-range",
        align: "left",
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
        saveFormat: function (value) {
          return;
        },
      },
      {
        sortable: true,
        name: "alterDate",
        add: false,
        editable: false,
        label: "alterDate",
        inputType: "date-range",

        align: "left",
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
        saveFormat: function (value) {
          return;
        },
      },
      {
        sortable: true,
        name: "startDate",
        inputType: "date-range",
        editable: true,
        label: "startDate",
        align: "left",
        saveFormat: function (value) {
          return Formatter.buildAmericanDate(value);
        },
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },
      {
        sortable: true,
        name: "endDate",
        inputType: "date-range",
        editable: true,
        label: "endDate",
        align: "left",
        saveFormat: function (value) {
          return value ? Formatter.buildAmericanDate(value) : null;
        },
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },
    ],
  },
  actions: { ...actions, ...customActions },
  getters,
  mutations,
};
