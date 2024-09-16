<template>
  <DefaultTable :configs="configs" />
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  components: {},

  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
    configs() {
      return {
        externalFilters: false,
        store: "contracts",
        categories: ["contract"],
        add: true,
        delete: true,
        filters: true,
        selection: false,
        search: false,
        columns: {
          category: {
            filters: {
              context: "contract",
              company: "/people/" + this.defaultCompany.id,
            },
          },
        },
      };
    },
  },
};
</script>
