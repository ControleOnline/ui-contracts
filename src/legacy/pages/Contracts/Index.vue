<template>
  <q-page padding>

    <div v-if="pageLoading" class="row">
      <div class="col-12 pageloader">
        <q-spinner
          color="primary"
          class="q-uploader__spinner"
        />
      </div>
    </div>

    <div v-else class="row">
      <div class="col-12">
        <contract-list
          :config="setConfig"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ContractIndexPage',

  data() {
    return {
      pageLoading: true,
    }
  },

  computed: {
    ...mapGetters({
      currentCompany : 'people/currentCompany',
    })
  },

  created() {
    if (this.currentCompany) {
      this.pageLoading = false;
    }
  },
  
  watch: {
    currentCompany(data) {
      if (data) {
        this.pageLoading = false;
      }
    }
  },

  methods: {
    setConfig(configs) {
      // config api
      configs.Api.setAsFake (false);
      configs.Api.setBaseUrl('https://api.dev.foccuscegonhas.com.br/');
      configs.Api.setToken  (this.$store.getters['auth/user'].token);

      // config routes
      configs.Routes.Details.name = 'ContractDetails';
      
      // config params
      configs.Params.Company
        .getter = () => {
          return this.$store.getters['people/currentCompany'].id;
        };
    },
  },
}
</script>

<style lang="scss" scoped>
.pageloader{
  text-align: center;
  margin-top: 200px;
}
</style>