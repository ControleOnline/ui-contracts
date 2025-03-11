<template>
  <q-page padding>
    <div v-if="pageLoading" class="row">
      <div class="col-12 pageloader">
        <q-spinner color="primary" class="q-uploader__spinner" />
      </div>
    </div>

    <div class="row back-white" v-else-if="!isSaved">
      <div class="col-12">
        <AcceptForm :payer="payerData" @saved="onSave" />
      </div>
    </div>

    <div class="row back-white" v-else>
      <div class="col-12">
        <h5>
          Muito Obrigado
          <q-icon class="green" name="check_circle" />
        </h5>
        <br />
        <h6>
          Os dados foram preenchidos,<br />
          Enviaremos um e-mail para que você realize a assinatura digital.<br />
        </h6>
      </div>
    </div>
  </q-page>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";
import AcceptForm from "../../components/AcceptForm.vue";

export default {
  components: {
    AcceptForm,
  },

  data() {
    return {
      isSaved: false,
      id: null,
      pageLoading: false,
      payerData: {
        carModel: "",
        other_informations: {
          carColor: "",
          carNumber: "",
          renavan: "",
        },
        personType: "PF",
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

  created() {
    if (this.$route.params.id) {
      this.id = decodeURIComponent(this.$route.params.id);

      this.getPayerData().then((response) => {
        if (response && response.response && response.response.data) {
          var data = response.response.data;

          this.payerData = data;

          if (data.contractId) {
            this.isSaved = true;
          }
        }
      });
    }
  },

  methods: {
    getPayerData() {
      this.pageLoading = true;

      let options = {
        method: "GET",
        params: {},
      };

      return api.fetch(`accept-order-payer/${this.id}`, options).then((data) => {
        this.pageLoading = false;
        return data;
      });
    },
    onSave(data) {
      this.pageLoading = true;

      let options = {
        method: "POST",
        body: (data)
      };

      return api.fetch(`accept-order-payer/save/${this.id}`, options)
        .then((data) => {
          if (data && data.response && data.response.success) {
            this.$q.notify({
              message: "Os dados foram salvos com sucesso",
              position: "bottom",
              type: "positive",
            });
            this.isSaved = true;
          }

          return data;
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
  },
};
</script>

<style scoped>
.green {
  color: green;
}
.back-white {
  border-radius: 10px;
  background-color: white !important;
}
.back-white > div {
  padding: 10px;
}
.pageloader {
  text-align: center;
}
</style>
