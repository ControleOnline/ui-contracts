<template>
  <DefaultDetail :configs="configs" :id="contractId" />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import DefaultDetail from "@controleonline/ui-default/src/components/Default/Common/DefaultDetail.vue";

export default {
  components: { DefaultDetail },
  data() {
    return {
      contractId: null,
    }

  },
  created() {
    this.contractId = decodeURIComponent(this.$route.params.id);
  },
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
