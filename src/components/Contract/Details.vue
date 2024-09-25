<template>
  <DefaultDetail :configs="configs" :id="contractId" />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import DefaultDetail from "@controleonline/ui-default/src/components/Default/Common/DefaultDetail.vue";

export default {
  components: { DefaultDetail },
  props: {
    context: {
      required: false,
      default: this.context,
    },
  },
  data() {
    return {
      contractId: null,
    };
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
