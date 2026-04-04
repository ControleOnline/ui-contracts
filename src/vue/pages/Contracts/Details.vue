<template>
  <Contract :context="context" :contractId="contractId" />
</template>

<script>
import Contract from "@controleonline/ui-contracts/src/vue/components/Contract/Details.vue";

export default {
  components: {
    Contract,
  },

  data() {
    return {
      context: "contract",
      contractId: null,
    };
  },
  created() {
    this.contractId = decodeURIComponent(this.$route.params.id);
  },
};
</script>
