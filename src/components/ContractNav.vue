<template>
  <div v-if="contract.hasOriginal() || contract.hasAmended()"
    class="row q-pt-sm q-pb-sm q-gutter-xs justify-end"
  >
    <q-btn flat no-caps
      v-if  ="contract.hasOriginal()"
      :to   ="Routes.Details.get(contract.original.id)"
      :label="$t('contracts.go_original')"
    />

    <q-btn flat no-caps
      v-if  ="contract.hasAmended()"
      :to   ="Routes.Details.get(contract.amended.id)"
      :label="$t('contracts.go_amended')"
    />
  </div>
</template>

<script>
import Contract from '../entity/Contract';
import configurable from '../mixins/configurable';

export default {
  name  : 'ContractNav',
  mixins: [ configurable ],

  props: {
    contract: {
      type    : Contract,
      required: true
    },
  },

  data() {
    return {

    }
  },
};
</script>
