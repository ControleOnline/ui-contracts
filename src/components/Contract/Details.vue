<template>
  <DefaultDetail :configs="configs" :id="contractId" />

  <Html
    v-if="item && item.contractFile && item.contractFile.extension == 'html'"
    :readonly="false" 
    :generatePDF="true"
    :data="item.contractFile"
    @changed="changed"
  />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Html from "@controleonline/ui-default/src/components/Default/Common/Inputs/Html.vue";
import DefaultDetail from "@controleonline/ui-default/src/components/Default/Common/DefaultDetail.vue";
import getConfigs from "./Configs";

export default {
  components: { DefaultDetail, Html },
  props: {
    context: {
      required: false,
      default: "contract",
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
      myCompany: "people/currentCompany",
    }),
    item() {
      return this.$store.getters["contract/item"];
    },
    configs() {
      let config = getConfigs(
        this.context,
        this.myCompany,
        this.$components,
        this.$store
      );
      return config;
    },
  },
  methods: {
    changed(data) {
    },
  },
};
</script>
