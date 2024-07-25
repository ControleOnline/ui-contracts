<template>
  <q-form @submit="onSubmit" class="q-mt-sm" ref="myForm">
    <div class="row q-col-gutter-sm">
      <div class="col-xs-12">
        <q-input
      dense
      outlined stack-label borderless readonly
          v-model ="status"
          :label  ="$t('contracts.status')"
        >
        </q-input>
      </div>

      <div class="col-xs-12 col-sm-6">
        <q-select dense outlined  stack-label emit-value map-options :hide-dropdown-icon="readOnly"
          v-model    ="template"
          :label     ="$t('contracts.model')"
          :options   ="contractModels"
          :loading   ="loadingModels"
          :outlined  ="!readOnly"
          :borderless="readOnly"
          :readonly  ="readOnly"
          :rules     ="[val => val !== null || $t('messages.select_an_option')]"
        >
        </q-select>
      </div>

      <div class="col-xs-12 col-sm-6">
        <q-input
      dense
      outlined stack-label
          v-model    ="startDate"
          mask       ="##/##/####"
          :label     ="$t('contracts.start_date')"
          :rules     ="[isInvalid('date')]"
          :outlined  ="!readOnly"
          :borderless="readOnly"
          :readonly  ="readOnly"
        >
          <template v-slot:append v-if="!readOnly">
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="qDateProxy1" transition-show="scale" transition-hide="scale">
                <q-date
                  v-model ="startDate"
                  mask    ="DD/MM/YYYY"
                  @input  ="() => {
                    $refs.qDateProxy1
                      .hide();
                  }"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <div class="row justify-end">
      <q-btn
         type     ="submit"
         color    ="primary"
         :label   ="$t('contracts.save')"
         :loading ="isSaving"
         :disable ="readOnly"
      />
    </div>
  </q-form>
</template>

<script>
import Contract from '../entity/Contract';

import configurable from '../mixins/configurable';
import validation from '../mixins/validation';

export default {
  name  : 'ContractForm',
  mixins: [ configurable, validation ],

  props: {
    contract : {
      type    : Contract,
      required: true
    },
    readOnly: {
      type    : Boolean,
      required: false,
      default : false
    }
  },

  created() {
    this.loadContractModels();
  },

  data() {
    return {
      status        : this.$t(`contracts.statuses.${this.contract.status}`),
      template      : null,
      startDate     : this.$formatter.formatDateYmdTodmY(this.contract.startDate),
      contractModels: [],
      loadingModels : false,
      isSaving      : false,
    }
  },

  methods: {
    onSubmit() {
      this.isSaving = true;

      this.Api.Contracts
        .Save({
          params : {
            id: this.contract.id
          },
          payload: {
            contractModel: this.template,
            startDate    : this.startDate.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1"),
          },
          query  : {
            myCompany : this.Params.Company.get(),
            myProvider: this.Params.Company.get(),
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
              message : this.$t(error.message),
              position: 'bottom',
              type    : 'negative',
            });
          })
          .finally(() => {
            this.isSaving = false;
          })
        ;
    },

    loadContractModels() {
      if (this.loadingModels) {
        return;
      }

      if (this.contractModels.length) {
        return;
      }

      this.loadingModels = true;
      this.Api.Contracts
        .GetTemplateList()
          .then(data => {
            let templates = [];

            if (data) {
              data.members.forEach(template => {
                templates.push({
                  label: template.contractModel,
                  value: template['@id'],
                });
              });
            }

            return templates;
          })
          .then(templates => {
            this.contractModels = templates;
            this.template       = this.contract.template['@id'];
          })
          .finally(() => {
            this.loadingModels = false;
          })
        ;
    },
  },
};
</script>
