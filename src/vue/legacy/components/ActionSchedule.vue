<template>
  <div>
    <q-btn flat
      color   ="secondary"
      :label  ="$t('contracts.add_schedule')"
      @click  ="dialog = true"
      icon    ="add"
      :disable="!contract.canEdit()"
    />

    <q-dialog v-model="dialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ $t('contracts.add_schedule') }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <ScheduleForm
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
import ScheduleForm from './ScheduleForm';

export default {
  name      : 'ContractActionSchedule',
  mixins    : [ configurable ],

  components: {
    ScheduleForm
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
