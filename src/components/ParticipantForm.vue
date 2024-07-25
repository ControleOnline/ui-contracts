<template>
  <q-form @submit="onSubmit" class="q-mt-sm" ref="myForm">
    <div class="row">
      <div class="col-xs-12">
        <SearchCustomer :config="config" @found="onSearchFound" @error="onSearchError" />
      </div>
    </div>

    <q-separator class="q-mt-sm q-mb-md" />

    <div class="row q-col-gutter-sm">
      <div class="col-xs-12 col-sm-6">
        <q-input
          dense
          outlined
          stack-label
          v-model="document"
          type="text"
          :label="$t('contracts.document')"
          :readonly="true"
        />
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-input
          dense
          outlined
          stack-label
          v-model="email"
          type="text"
          :label="$t('contracts.email')"
          :readonly="true"
        />
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-input
          dense
          outlined
          stack-label
          v-model="name"
          type="text"
          :label="$t('contracts.name')"
          :readonly="true"
        />
      </div>
      <div class="col-xs-12 col-sm-6 q-mb-md">
        <q-input
          dense
          outlined
          stack-label
          v-model="alias"
          type="text"
          :label="$t('contracts.alias')"
          :readonly="true"
        />
      </div>
      <div class="col-xs-12">
        <q-select
          dense
          outlined
          multiple
          use-chips
          stack-label
          emit-value
          map-options
          v-model="peopleRoles"
          :label="$t('contracts.participation')"
          :options="roles"
          :rules="[(val) => val !== null || $t('messages.select_an_option')]"
        />
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-input
          dense
          outlined
          stack-label
          reverse-fill-mask
          suffix="%"
          v-model="percentage"
          type="text"
          :label="$t('contracts.percent')"
          mask="#,##"
          fill-mask="0"
          :rules="[isInvalid()]"
        />
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="paymentDay"
          :label="$t('contracts.payment_day')"
          :options="monthDays"
          :rules="[(val) => val !== null || $t('messages.select_an_option')]"
        />
      </div>
    </div>
    <div class="row justify-end">
      <q-btn
        type="submit"
        color="primary"
        :label="$t('contracts.save')"
        :loading="isSaving"
      />
    </div>
  </q-form>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";
import Contract from "../entity/Contract";
import configurable from "../mixins/configurable";
import validation from "../mixins/validation";
import SearchCustomer from "./SearchCustomer";

export default {
  name: "ContractParticipantForm",
  mixins: [configurable, validation],

  components: {
    SearchCustomer,
  },

  props: {
    contract: {
      type: Contract,
      required: true,
    },
  },

  created() {
    this.loadMonthDays();
    this.loadParticipantRoles();
  },

  data() {
    return {
      isSaving: false,
      peopleRoles: [],
      percentage: null,
      paymentDay: null,
      roles: [],
      monthDays: [],
      name: null,
      alias: null,
      customerId: null,
      document: null,
      email: null,
    };
  },

  methods: {
    onSearchFound(customer) {
      this.customerId = customer.id;
      this.name = customer.name;
      this.alias = customer.alias;
      this.paymentDay = customer.paymentDay;
      this.document = this.$formatter.formatBRDocument(
        customer.isPerson() ? customer.cpf : customer.cnpj
      );
      this.email = customer.email;
    },

    onSearchError(error) {
      this.customerId = null;
      this.name = null;
      this.alias = null;
      this.paymentDay = null;
      this.document = null;
      this.email = null;
    },

    loadMonthDays() {
      for (let day = 1; day < 32; day++) {
        this.monthDays.push({
          label: day,
          value: day,
        });
      }
    },

    loadParticipantRoles() {
      this.roles.push({
        label: this.$t(`contracts.roles.Beneficiary`),
        value: "Beneficiary",
      });

      this.roles.push({
        label: this.$t(`contracts.roles.Payer`),
        value: "Payer",
      });
    },

    onSubmit() {
      if (!this.customerId) {
        return;
      }

      this.isSaving = true;

      const asyncForEach = async (roles) => {
        for (let i = 0; i < roles.length; i++) {
          await this.addParticipant({
            payload: {
              contract: `/my_contracts/${this.contract.id}`,
              people: `/people/${this.customerId}`,
              peopleType: roles[i],
              contractPercentage: parseFloat(this.percentage.replace(/([,])/g, "\.")),
            },
            query: {
              myCompany: this.Params.Company.get(),
              myProvider: this.Params.Company.get(),
            },
          });
        }
      };

      asyncForEach(this.peopleRoles)
        .then(() => {
          this.$q.notify({
            message: this.$t("messages.saved_successfully"),
            position: "bottom",
            type: "positive",
          });

          this.$emit("added");
        })

        .finally(() => {
          this.isSaving = false;
        });
    },

    async addParticipant(data) {
      return api.fetch.Contracts.AddParticipant(data);
    },
  },
};
</script>
