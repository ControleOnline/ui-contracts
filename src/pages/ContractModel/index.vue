<template>
  <Contracts :context="context" />
</template>

<script>
import Contracts from "@controleonline/ui-contracts/src/components/ContractModel/Table";

export default {
  components: {
    Contracts,
  },

  computed: {},

  data() {
    return {
      context: "contract",
    };
  },

  methods: {},
};
</script>
