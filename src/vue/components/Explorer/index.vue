<template>eeee</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  components: {},
  props: {},
  data() {
    return {};
  },
  created() {
    console.log(this.task);
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
      task: "tasks/item",
    }),
  },
};
</script>
