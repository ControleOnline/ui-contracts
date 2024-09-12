<template>
  <q-form @submit="onSubmit" class="q-mt-sm" ref="myForm">
    <div class="row q-col-gutter-sm">
      <div class="col-xs-12">
        <q-select
          dense
          outlined
          stack-label
          v-model="product"
          :label="$t('contracts.product')"
          :options="products"
          :loading="isLoadingProds"
          @update:model-value="price = (parseFloat(product.price) + 0.001).toFixed(2)"
          :rules="[(val) => val !== null || $t('messages.select_an_option')]"
        >
        </q-select>
      </div>

      <div class="col-xs-12 col-sm-6">
        <q-input
          dense
          outlined
          stack-label
          reverse-fill-mask
          prefix="R$"
          v-model="price"
          type="text"
          :label="$t('contracts.price')"
          mask="#,##"
          fill-mask="0"
          :rules="[isInvalid()]"
        />
      </div>

      <div class="col-xs-12 col-sm-6">
        <q-input
          dense
          outlined
          stack-label
          reverse-fill-mask
          v-model="quantity"
          type="text"
          :label="
            product !== null && product.type == 'Registration'
              ? $t('contracts.parcels')
              : $t('contracts.quantity')
          "
          mask="#"
          fill-mask="0"
          :rules="[isInvalid()]"
        />
      </div>

      <div v-if="product !== null && product.type == 'Registration'" class="col-xs-12">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="payer"
          :label="$t('contracts.payer')"
          :options="payers"
          :rules="[
            (val) =>
              (val !== null && product !== null && product.type == 'Registration') ||
              'Selecione um pagador',
          ]"
          :loading="isLoadingPayers"
        />
      </div>
    </div>
    <div class="row q-mt-md justify-end">
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
import Contract from "../entity/Contract";
import configurable from "../mixins/configurable";
import validation from "../mixins/validation";

export default {
  name: "ContractProductForm",
  mixins: [configurable, validation],

  props: {
    contract: {
      type: Contract,
      required: true,
    },
  },

  created() {
    this.loadingProducts();
    this.loadPayers();
  },

  data() {
    return {
      isSaving: false,
      product: null,
      price: null,
      quantity: null,
      payer: null,
      products: [],
      isLoadingProds: false,
      payers: [],
      isLoadingPayers: false,
    };
  },

  methods: {
    onSubmit() {
      this.isSaving = true;

      this.Api.Contracts.AddProduct({
        params: {
          id: this.contract.id,
        },
        query: {
          myCompany: this.Params.Company.get(),
          myProvider: this.Params.Company.get(),
        },
        payload: {
          product: this.product.value,
          quantity: this.product.type == "Registration" ? 1 : parseInt(this.quantity),
          price: parseFloat(this.price.replace(",", ".")),
          payer: this.product.type == "Registration" ? this.payer : null,
          parcels: this.product.type == "Registration" ? parseInt(this.quantity) : null,
        },
      })
        .then((data) => {
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

    loadingProducts() {
      if (this.isLoadingProds) return;

      this.isLoadingProds = true;

      this.Api.Products.GetAll()
        .then((products) => {
          let data = [];

          if (products) {
            products.forEach((product) => {
              data.push({
                label: product.product,
                value: product["@id"].replace(/\D/g, ""),
                price: product.price,
                type: product.productType,
              });
            });
          }

          this.products = data;
        })
        .catch((error) => {})
        .finally(() => {
          this.isLoadingProds = false;
        });
    },

    loadPayers() {
      if (this.isLoadingPayers) return;

      this.isLoadingPayers = true;

      this.Api.Contracts.GetParticipants({
        query: {
          peopleType: "Payer",
        },
        params: {
          id: this.contract.id,
        },
      })
        .then((participants) => {
          let payers = [];

          participants.members.forEach((contractPeople) => {
            payers.push({
              label: `${contractPeople.people.name} ${contractPeople.people.alias}`,
              value: contractPeople.people["@id"].replace(/\D/g, ""),
            });
          });

          this.payers = payers;
        })
        .finally(() => {
          this.isLoadingPayers = false;
        });
    },
  },
};
</script>
