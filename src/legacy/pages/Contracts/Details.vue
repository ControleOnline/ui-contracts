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

    <contract-detail
      v-else
      ref    ="contractDetail"
      :id    ="id"
      :config="setConfig"
      :panels="panels"
    >
      <template v-slot:contract="{ contract, config }">
        <contract-nav
          :config  ="config"
          :contract="contract"
        />
        <contract-form
          :config    ="config"
          :contract  ="contract"
          :readOnly  ="!contract.canEdit()"
        />
      </template>

      <template v-slot:participants="{ contract, config }">
        <div class="row q-mb-md justify-end">
          <contract-action-participant
            :config  ="config"
            :contract="contract"
            @added   ="$refs.participantList.reload()"
          />
        </div>
        <contract-participant-list
          ref      ="participantList"
          :config  ="config"
          :contract="contract"
          :readOnly="!contract.canEdit()"
        />
      </template>

      <template v-slot:products="{ contract, config }">
        <div class="row q-mb-md justify-end">
          <contract-action-product
            :config  ="config"
            :contract="contract"
            @added   ="$refs.productList.reload()"
          />
        </div>
        <contract-product-list
          ref      ="productList"
          :config  ="config"
          :contract="contract"
          :readOnly="!contract.canEdit()"
        />
      </template>

      <template v-slot:document="{ contract, config }">
        <contract-document
          :config   ="config"
          :contract ="contract"
          @requested="$refs.contractDetail.loadContract()"
        />
      </template>
    </contract-detail>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ContractDetailsPage',

  data() {
    return {
      id         : null,
      panels     : [],
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

    if (this.$route.params.id) {
      this.id = decodeURIComponent(this.$route.params.id);
    }
    this.setPanels();
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

      configs.Api.setBaseUrl(this.$entrypoint);
      configs.Api.setToken  (this.$store.getters['auth/user'].token);
      
      // config routes

      configs.Routes.Details.name  = 'ContractDetails';
      configs.Routes.Customer.name = 'ClientDetails';
      
      // config params
      configs.Params.Company
        .getter = () => {
          return this.$store.getters['people/currentCompany'].id;
        };
    },
    
    setPanels() {
      let panels = [];
      panels.push({
        name: 'contract',
        icon: 'edit'
      });
      panels.push({
        name: 'participants',
        icon: 'people'
      });
      panels.push({
        name: 'products',
        icon: 'shopping_cart'
      });
      panels.push({
        name: 'document',
        icon: 'article'
      });
      this.panels = panels;
    },
  }
}
</script>

<style lang="scss" scoped>
.pageloader{
  text-align: center;
  margin-top: 200px;
}
</style>