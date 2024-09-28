<template>
  <Orders :context="context" />
</template>

<script>
import Orders from "@controleonline/ui-contracts/src/components/ContractModel/Details.vue";

export default {
  components: {
    Orders,
  },

  data() {
    return {
      context: "contract",
    };
  },
  created() {},
};
</script>
