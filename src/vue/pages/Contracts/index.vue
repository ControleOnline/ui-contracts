<template>
  <Contracts :context="context" />
</template>

<script>
import Contracts from "@controleonline/ui-contracts/src/vue/components/Contract/Table";

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
