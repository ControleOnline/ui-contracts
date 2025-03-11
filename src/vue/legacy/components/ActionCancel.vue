<template>
  <div>
    <q-btn flat
      color   ="secondary"
      :label  ="$t('contracts.cancel_contract')"
      @click  ="dialog = true"
      :disable="!canCancel"
      icon    ="cancel"
    />

    <q-dialog v-model="dialog">
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ $t('contracts.select_data') }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit" class="q-mt-sm">
            <div class="row justify-center">
              <q-date minimal
                v-model ="cancelDate"
                mask    ="DD/MM/YYYY"
                :options="calendarOptions"
              />
            </div>
            <div class="row justify-end q-mt-md">
              <q-btn
                type    ="submit"
                color   ="primary"
                :label  ="$t('contracts.save')"
                :loading="isCanceling"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { date } from 'quasar';
import Contract from '../entity/Contract';
import configurable from '../mixins/configurable';

export default {
  name  : 'ContractActionCancel',
  mixins: [ configurable ],

  props: {
    contract: {
      type    : Contract,
      required: true
    },
  },

  computed: {
    canCancel() {
      return ['Draft', 'Active']
        .includes(this.contract.status) && this.contract.endDate == null;
    },
  },

  data() {
    return {
      dialog     : false,
      cancelDate : null,
      isCanceling: false,
    }
  },

  methods: {
    calendarOptions(_date) {
      return _date > date.formatDate(Date.now(), 'YYYY/MM/DD');
    },

    onSubmit() {
      if (this.cancelDate == null) {
        this.$q.notify({
          message : this.$t('messages.select_a_date'),
          position: 'bottom',
          type    : 'negative',
        });
        return;
      }

      this.isCanceling = true;

      this.Api.Contracts
        .Cancel({
          params : {
            id: this.contract.id,
          },
          payload: {
            endDate: this.cancelDate.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1"),
          },
          query  : {
            myCompany: this.Params.Company.get()
          }
        })
          .then(contract => {
            this.$q.notify({
              message : this.$t('messages.saved_successfully'),
              position: 'bottom',
              type    : 'positive',
            });
          })
          .catch(e => {
            this.$q.notify({
              message : this.$t(e.message),
              position: 'bottom',
              type    : 'negative',
            });
          })
          .finally(() => {
            this.isCanceling = false;
            this.dialog      = false;
          })
        ;
    },
  },
};
</script>
