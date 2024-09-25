<template>
  <DefaultTable :configs="configs" />
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  components: {},
  props: {
    context: {
      required: false,
      default: "contracts",
    },
  },
  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
    configs() {
      return {
        externalFilters: false,
        store: this.context,
        status: [this.context],
        add: true,
        delete: true,
        filters: true,
        selection: false,
        search: false,
        columns: {
          contractModel: {
            component: this.$components.DefaultTable,
            icon: "person",
            externalFilters: false,
            store: "contract_model",
            filters: true,
            add: true,
            delete: true,
            selection: false,
            search: false,
          },
          status: {
            filters: {
              context: this.context,
              company: "/people/" + this.defaultCompany.id,
            },
          },
        },
      };
    },
  },
};
</script>
