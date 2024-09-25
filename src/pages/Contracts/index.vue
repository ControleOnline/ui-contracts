<template>
  <Contracts :context="context" />
</template>

<script>
import Contracts from "@controleonline/ui-contracts/src/components/Contract/Table";

export default {
  components: {
    Contracts,
  },

  computed: {},

  data() {
    return {
      context: "contracts",
    };
  },

  methods: {},
};
</script>
