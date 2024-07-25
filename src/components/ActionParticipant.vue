<template>
  <div>
    <q-btn flat
      color   ="secondary"
      :label  ="$t('contracts.add_participant')"
      @click  ="dialog = true"
      icon    ="add"
      :disable="!contract.canEdit()"
    />

    <q-dialog v-model="dialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ $t('contracts.add_participant') }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <ParticipantForm
            :config  ="config"
            :contract="contract"
            @added   ="onAdded"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import Contract from '../entity/Contract';
import configurable from '../mixins/configurable';
import ParticipantForm from './ParticipantForm';

export default {
  name      : 'ContractActionParticipant',
  mixins    : [ configurable ],

  components: {
    ParticipantForm
  },

  props     : {
    contract: {
      type    : Contract,
      required: true
    },
  },

  data() {
    return {
      dialog: false,
    }
  },

  methods: {
    onAdded() {
      this.$emit('added')
    }
  },
};
</script>
