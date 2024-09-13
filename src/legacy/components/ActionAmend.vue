<template>
  <div>
    <q-btn flat
      color   ="secondary"
      :label  ="$t('contracts.create_amended')"
      @click  ="onClick"
      :disable="contract.status != 'Active'"
      :loading="isCreating"
      icon    ="add"
    />
  </div>
</template>

<script>
import Contract from '../entity/Contract';
import configurable from '../mixins/configurable';

export default {
  name  : 'ContractActionAmend',
  mixins: [ configurable ],

  props: {
    contract: {
      type    : Contract,
      required: true,
    },
  },

  data() {
    return {
      isCreating: false,
    }
  },

  methods: {
    onClick() {
      this.isCreating = true;

      this.Api.Contracts
        .CreateAddendum({
          params : {
            id: this.contract.id,
          },
          payload: {},
          query  : {
            myCompany: this.Params.Company.get()
          }
        })
          .then(contract => {
            this.$router.push(
              this.Routes.Details.get(contract['@id'].replace(/\D/g, ''))
            );
          })
          .catch(e => {
            this.$q.notify({
              message : this.$t(e.message),
              position: 'bottom',
              type    : 'negative',
            });
          })
          .finally(() => {
            this.isCreating = false;
          })
        ;
    },
  },
};
</script>
