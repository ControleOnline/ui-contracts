<template>
  <Orders :context="context" />
</template>

<script>
import Orders from "@controleonline/ui-contracts/src/components/Contract/Details.vue";

export default {
  components: {
    Orders,
  },

  data() {
    return {
      context: "contracts",
    };
  },
  created() {},
};
</script>
