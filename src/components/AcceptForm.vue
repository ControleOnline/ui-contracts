<template>
  <q-form @submit="save" class="q-mt-sm" ref="myForm">
    <h5 class="text-center">Precisamos de alguns dados para finalizar seu contrato</h5>

    <q-separator spaced />

    <span>Dados do veículo a ser transportado</span>
    <div class="row justify-center q-pb-md">
      <div class="col-xs-12 col-sm-12 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          v-model="form.carModel"
          type="text"
          :label="$t('Modelo do carro')"
          placeholder="Modelo do carro"
          :rules="[isInvalid('car_model')]"
          :disable="payer.carModel ? true : false"
        />
      </div>
      <div class="col-xs-12 col-sm-4 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          v-model="form.other_informations.carColor"
          type="text"
          :label="$t('Cor do carro')"
          placeholder="Cor do carro"
          :rules="[isInvalid('car_color')]"
        />
      </div>
      <div class="col-xs-12 col-sm-4 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          unmasked-value
          v-model="form.other_informations.carNumber"
          type="text"
          :label="$t('Placa do Carro')"
          placeholder="Placa do Carro"
          :rules="[isInvalid('car_number')]"
        />
      </div>
      <div class="col-xs-12 col-sm-4 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          unmasked-value
          v-model="form.other_informations.renavan"
          type="text"
          :label="$t('Renavan')"
          placeholder="Renavan"
          :rules="[isInvalid('renavan')]"
        />
      </div>
    </div>

    <q-separator spaced />

    <div class="row justify-center q-pb-md">
      <q-btn-toggle
        flat
        no-caps
        v-model="form.personType"
        toggle-color="primary"
        :options="[
          { label: 'Pessoa Jurídica', value: 'PJ' },
          { label: 'Pessoa Física', value: 'PF' },
        ]"
      />
    </div>

    <div class="row justify-center q-pb-md">
      <div class="col-xs-12 col-sm-6 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          unmasked-value
          v-model="form.document"
          type="text"
          :label="form.personType == 'PJ' ? $t('CNPJ') : $t('CPF')"
          :mask="form.personType == 'PJ' ? '##.###.###/####-##' : '###.###.###-##'"
          :placeholder="form.personType == 'PJ' ? 'Digite o CNPJ' : 'Digite o CPF'"
          :rules="[isInvalid('document')]"
        />
      </div>
      <div class="col-xs-12 col-sm-6 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          v-model="form.birthDate"
          :rules="[isInvalid('birthDate')]"
          :label="'Data de Nascimento'"
          mask="##/##/####"
          placeholder="Data de Nascimento"
        >
        </q-input>
      </div>
    </div>

    <div class="row justify-center q-pb-md">
      <div class="col-xs-12 col-sm-6 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          v-model="form.name"
          type="text"
          :label="form.personType == 'PJ' ? 'Razão social' : 'Nome'"
          :rules="[isInvalid('name')]"
        />
      </div>
      <div class="col-xs-12 col-sm-6 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          v-model="form.alias"
          type="text"
          :label="form.personType == 'PJ' ? 'Nome fantasia' : 'Sobrenome'"
          :rules="[isInvalid('alias')]"
        />
      </div>
    </div>

    <div class="row justify-center q-pb-md">
      <div class="col-xs-12 col-sm-6 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          v-model="form.email"
          type="text"
          :label="$t('Email')"
          placeholder="E-mail"
          :rules="[isInvalid('email')]"
        />
      </div>
      <div class="col-xs-12 col-sm-6 q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          unmasked-value
          v-model="form.phone"
          type="text"
          :label="$t('Telefone')"
          mask="(##) #####-####"
          placeholder="Telefone"
          :rules="[isInvalid('phone')]"
        />
      </div>
    </div>

    <div class="row q-col-gutter-xs q-pb-xs">
      <div class="col-xs-12 text-subtitle1 text-left">
        Digite o endereço na caixa de busca
      </div>
      <div class="col-xs-12 q-mb-sm">
        <ListAutocomplete
          :source="getGeoPlaces"
          :isLoading="isSearching"
          label="Busca de endereço"
          @selected="onSelect"
          placeholder="Digite o endereço completo (rua, número, bairro, CEP)"
        />
      </div>
    </div>

    <div class="row q-col-gutter-sm q-pb-xs">
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          unmasked-value
          hide-bottom-space
          v-model="form.address.postal_code"
          type="text"
          :label="$t('CEP')"
          mask="#####-###"
          :rules="[isInvalid('address.postal_code')]"
        />
      </div>
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          hide-bottom-space
          v-model="form.address.street"
          type="text"
          :label="$t('Rua')"
          :rules="[isInvalid('address.street')]"
        />
      </div>
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          hide-bottom-space
          v-model="form.address.number"
          type="text"
          :label="$t('Número')"
          :rules="[isInvalid('address.number')]"
        />
      </div>
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          hide-bottom-space
          v-model="form.address.complement"
          type="text"
          :label="$t('Complemento')"
        />
      </div>
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          hide-bottom-space
          v-model="form.address.district"
          type="text"
          :label="$t('Bairro')"
          :rules="[isInvalid('address.district')]"
        />
      </div>
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          hide-bottom-space
          v-model="form.address.city"
          type="text"
          :label="$t('Cidade')"
          :rules="[isInvalid('address.city')]"
        />
      </div>
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          hide-bottom-space
          v-model="form.address.state"
          type="text"
          :label="$t('UF')"
          mask="AA"
          :rules="[isInvalid('address.state')]"
        />
      </div>
      <div class="col-xs-12 col-sm-grow q-mb-sm">
        <q-input
          dense
          outlined
          stack-label
          lazy-rules
          hide-bottom-space
          v-model="form.address.country"
          type="text"
          :label="$t('País')"
          :rules="[isInvalid('address.country')]"
        />
      </div>
    </div>
    <div class="row justify-end">
      <q-btn type="submit" color="primary" label="Salvar" />
    </div>
  </q-form>
</template>

<script>
import ListAutocomplete from "@controleonline/ui-legacy/ui-common/src/components/Common/ListAutocomplete";
import { mapActions } from "vuex";

export default {
  components: {
    ListAutocomplete,
  },

  props: {
    payer: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      isSearching: false,
      form: {
        birthDate: "",
        carModel: "",
        other_informations: {
          carColor: "",
          carNumber: "",
          renavan: "",
        },
        carNumber: "",
        personType: "PJ",
        name: "",
        alias: "",
        document: "",
        rg: "",
        email: "",
        phone: "",
        address: {
          postal_code: "",
          street: "",
          number: "",
          complement: "",
          district: "",
          city: "",
          state: "",
          country: "",
        },
      },
    };
  },

  watch: {
    payer: function (value) {
      this.setFormData();
    },
  },

  created() {
    this.setFormData();
  },

  methods: {
    ...mapActions({
      geoplace: "gmaps/geoplace",
    }),

    save() {
      this.$emit("saved", this.form);
    },

    setFormData() {
      if (this.payer) {
        var payer = this.payer;

        this.form.personType = payer.personType;

        if (payer.carModel) {
          this.form.carModel = payer.carModel;
        }

        if (payer.other_informations.carColor) {
          this.form.other_informations.carColor = payer.other_informations.carColor;
        }

        if (payer.other_informations.carNumber) {
          this.form.other_informations.carNumber = payer.other_informations.carNumber;
        }

        if (payer.name) {
          this.form.name = payer.name;
        }

        if (payer.alias) {
          this.form.alias = payer.alias;
        }

        if (payer.document) {
          this.form.document = payer.document;
        }

        if (payer.birthDate) {
          this.form.birthDate = payer.birthDate;
        }

        if (payer.email) {
          this.form.email = payer.email;
        }

        if (payer.phone) {
          this.form.phone = payer.phone;
        }

        if (payer.address) {
          var address = payer.address;

          if (address.postal_code) {
            this.form.address.postal_code = address.postal_code;
          }

          if (address.street) {
            this.form.address.street = address.street;
          }

          if (address.number) {
            this.form.address.number = address.number;
          }

          if (address.complement) {
            this.form.address.complement = address.complement;
          }

          if (address.district) {
            this.form.address.district = address.district;
          }

          if (address.city) {
            this.form.address.city = address.city;
          }

          if (address.state) {
            this.form.address.state = address.state;
          }

          if (address.country) {
            this.form.address.country = address.country;
          }
        }
      }
    },

    isInvalid(key) {
      switch (key) {
        case "renavan":
          return true;
          break;
      }

      return (val) => {
        if (!(val && val.length > 0)) return this.$t("messages.fieldRequired");
        return true;
      };
    },

    getGeoPlaces(input) {
      this.isSearching = true;

      return this.geoplace(input).then((result) => {
        this.isSearching = false;

        if (result.success) {
          let items = [];
          for (let i = 0; i < result.data.length; i++) {
            items.push({
              label: result.data[i].description,
              value: result.data[i],
            });
          }
          return items;
        }
      });
    },

    setAddress(data) {
      if (!data) return;
      this.form.address.country = data.country;
      this.form.address.state = data.state;
      this.form.address.city = data.city;
      this.form.address.district = data.district;
      this.form.address.postal_code = data.postal_code;
      this.form.address.street = data.street;
      this.form.address.number = data.number ? data.number.toString() : "";
      this.form.address.complement = data.complement ? data.complement : "";
    },

    onSelect(item) {
      this.setAddress({
        country: item.country,
        state: item.state,
        city: item.city,
        district: item.district,
        postal_code: item.postal_code,
        street: item.street,
        number: item.number,
      });
    },
  },
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
