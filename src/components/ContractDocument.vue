<template>
  <div v-if="!contract" class="flex column flex-center q-mt-lg">
    <q-icon name="warning" class="text-red" style="font-size: 4rem" />
    <q-banner dense inline-actions class="text-white bg-red q-pa-xs">
      <span v-html="'<strong>Ainda não há contrato para esse pedido</strong>'
        " style="font-size: 14px">
      </span>
    </q-banner>
  </div>

  <div class="row q-pa-md" v-else>

    <q-card class="q-pa-md q-mb-sm col-12">
      <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-4">
          <div class="row items-center justify-center">
              <div :class="statusStyle" class="relative-position full-width" v-if="contract">
                {{ this.$t(`contracts.statuses.${contractStatus}`) }} 
                <q-inner-loading :showing="isLoading">
                  <q-spinner-gears size="50px" color="primary" />                  
                </q-inner-loading> 
              </div>
            </div>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-5">
          <div class="row items-center justify-center">

            <q-btn color="red" :label="$t('contracts.cancel_contract')" @click="cancelContract" class="q-mr-sm"/>            
            <q-btn :color="isEditing ? 'secondary' : 'primary'"
              :label="$t(isEditing ? 'contracts.save' : 'contracts.edit')"
              @click="isEditing ? toggleSave() : toggleEdit()" />

            <q-dialog v-model="showDialogEditContract">
              <q-card>
                <q-card-section>
                  <p>Tem certeza de que deseja salvar alterações no contrato? Isso vai resultar em uma atualização
                    completa do contrato.</p>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn label="Cancelar" color="negative" @click="cancelChangeContract" />
                  <q-btn label="Confirmar" color="primary" @click="confirmChangeContract" />
                </q-card-actions>
              </q-card>
            </q-dialog>

          </div>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-3">
          <div class="row items-center justify-end">
            <q-btn color="secondary" :label="$t('contracts.request_signatures')" @click="requestSignatures"
              :disable="statusIsWaitingForSignature()" :loading="isRequesting" />
          </div>
        </div>
      </div>

    </q-card>

    <div class="col-12">
      <q-btn-toggle v-model="paymentType" toggle-color="primary" push glossy class="q-mb-md" :options="paymentOptions"
        @click="confirmChange"></q-btn-toggle>

      <q-dialog v-model="showConfirmationDialog">
        <q-card>
          <q-card-section>
            <p>Tem certeza de que deseja alterar a forma de pagamento?
              Isso vai resultar em uma atualização completa do contrato.
            </p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="negative" @click="cancelChange" />
            <q-btn label="Confirmar" color="primary" @click="changePayment" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <div v-if="participants.length > 0" class="col-12">
      <div class="text-h6 q-mb-md">
        {{ $t("contracts.signers") }}
      </div>
      <div v-for="(participant, index) in participants" :key="index" class="text-body2 q-mb-sm text-justify">
        {{ participant }}
      </div>
    </div>

    <div class="col-12">
      <div ref="contractDocument" class="contract-document"></div>
      <div class="flex flex-center">
        <q-circular-progress :indeterminate="isLoading" size="sm" color="primary" class="q-ma-md" />
      </div>

      <q-editor :disable="!isEditing" class="full-width" v-model="htmlContract" :dense="$q.screen.lt.md" :toolbar="[
        [
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify'],
          },
        ],
        [
          'bold',
          'italic',
          'strike',
          'underline',
          'subscript',
          'superscript',
        ],
        ['token', 'hr', 'link', 'custom_btn'],
        ['print', 'fullscreen'],
        [
          {
            label: $q.lang.editor.defaultFont,
            icon: $q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana',
            ],
          },
        ],

        ['undo', 'redo'],
        ['viewsource'],
      ]" :fonts="{
  arial: 'Arial',
  arial_black: 'Arial Black',
  comic_sans: 'Comic Sans MS',
  courier_new: 'Courier New',
  impact: 'Impact',
  lucida_grande: 'Lucida Grande',
  times_new_roman: 'Times New Roman',
  verdana: 'Verdana',
}" />
    </div>
  </div>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";
import { mapGetters } from "vuex";

import configurable from "../mixins/configurable";
import { date } from 'quasar';

export default {
  name: "ContractDocument",
  mixins: [configurable],

  props: {
    contract: {
      required: false,
    },
  },

  created() {
    if (this.contract) {
      this.loadParticipants();
      this.loadContractStatus();
    }
  },

  mounted() {
    if (this.contract) {
      this.loadDocument();
    }
  },

  data() {
    return {
      paymentOptions: [
        { label: this.$t("Payment.Options.Today"), value: 1 },
        { label: this.$t("Payment.Options.Before"), value: 5 },
        { label: this.$t("Payment.Options.Slice"), value: 2 },
        { label: this.$t("Payment.Options.Half"), value: 4 },
        { label: this.$t("Payment.Options.Card"), value: 3 },
      ],
      paymentType: "",
      participants: [],
      htmlContract: null,
      isEditing: false,
      cancelDate: null,
      isRequesting: false,
      isLoading: false,
      contractStatus: null,
      showConfirmationDialog: false,
      showDialogEditContract: false,
    };
  },

  watch: {

    currentCompany(data) {
      if (data) {
        this.pageLoading = false;
        this.loadDocument();
      }
    },

    paymentType(newPaymentType, oldPaymentType) {
      if (newPaymentType !== oldPaymentType) {
        this.showConfirmationDialog = true;
      }
    },

  },

  methods: {

    toggleEdit() {
      this.isEditing = true;
    },
    toggleSave() {
      console.log('Save');
      this.showDialogEditContract = true;
    },
    cancelChangeContract() {
      this.isEditing = false;
      this.showDialogEditContract = false;
    },
    confirmChangeContract() {
      if (this.isEditing) {
        this.saveContract();
        this.updateContractAmendedStatus();
      } else {
        this.isEditing = true;
      }

      this.showDialogEditContract = false;
    },

    loadContractStatus() {
      if (this.contract !== null) {
        let params = {
          method: "GET",
        };

        this.isLoading = true;

        api.fetch(`/my_contracts/${this.contract}`, params)
          .then((data) => {
            this.contractStatus = data.contractStatus;
          })
          .catch((error) => {
            console.error("Erro ao carregar contrato:", error);
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },

    changePayment() {
      this.showConfirmationDialog = false;

      const contractData = {
        id: this.contractId,
        contratante: this.contratante,
        contratante_doc_type: this.contratanteDocType,
        payment_type: this.paymentType,
      };

      function replaceVariables(data, html = '') {
        if (typeof html !== 'string') {
          html = html.toString();
        }

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const regex = new RegExp('{{\\s*' + key + '\\s*}}', 'g');
            html = html.replace(regex, data[key]);
          }
        }
        return html;
      }


      const updatedHtmlContent = replaceVariables(contractData);

      const params = {
        method: "PUT",
        body: JSON.stringify({
          paymentType: this.paymentType,
          htmlContent: updatedHtmlContent,
        }),
      };

      this.isLoading = true;

      const url = `/contracts/${this.contract}/change/payment`;

      api.fetch(url, params)
        .then(data => {
          if (data.response && data.response.success && data.response.data && data.response.data.contractId) {
            this.$q.notify({
              message: "Contrato atualizado com sucesso",
              position: "bottom",
              type: "positive",
            });
            this.loadDocument();
          }
          return data;
        })
        .catch(error => {
          console.error('Erro:', error);
          if (error instanceof SubmissionError) {
            return error.errors._error;
          } else {
            return error.message;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });

    },

    cancelChange() {
      this.showConfirmationDialog = false;
    },

    loadParticipants() {
      let params = {};
      params.myCompany = this.myCompany.id;
      api.fetch(`/my_contracts/${this.contract}/participants`, params)
        .then((response) => {
          response.response.data.forEach((participant) => {
            let info = "";

            info += this.$t(`contracts.roles.${participant.role}`) + ":";
            info += ` ${participant.people.name}.`;

            if (participant.people.address !== null) {
              info += ` Com sede na`;
              info += ` ${participant.people.address.street}`;
              info += ` nº ${participant.people.address.number}`;
              info += ` - CEP ${this.$formatter.formatBRPostalCode(participant.people.address.postalCode)}`;
              info += ` - ${participant.people.address.district}`;
              info += ` - ${participant.people.address.city}`;
              info += ` - ${participant.people.address.state}`;
            }

            if (participant.people.document !== null) {
              let document = this.$formatter.formatBRDocument(participant.people.document.id);

              if (participant.people.document.type == "CNPJ")
                info += `, inscrita no CNPJ sob nº ${document}.`;
              else {
                if (participant.people.document.type == "CPF")
                  info += `, CPF nº ${document}.`;
                else info += `, ${document}.`;
              }
            }

            if (info.length) {
              this.participants.push(info);
            }
          });
        });
    },

    loadDocument() {
      const params = {
        company: this.myCompany.id,
        myCompany: this.myCompany.id,
      };

      const url = `${this.$entrypoint}/my_contracts/${this.contract}/document`;

      const config = {
        method: 'GET',
        url: url,
        headers: {
          'Accept': 'application/ld+json',
          'API-TOKEN': this.logged.token,
        },
        params: params,
      };

      api.execute(config)
        .then((response) => {
          this.htmlContract = response.data;
        })
        .catch((error) => {
          console.error("Error loading document:", error);
        });
    },

    cancelContract() {
      const params = {
        method: "PUT",
        body: JSON.stringify({
          endDate: new Date().toDateString(),
        }),
      };
      const url = `/my_contracts/${this.contract}/cancel-contract`;

      api.fetch(url, params)
        .then(data => {
          this.loadContractStatus();
        })
        .catch(e => {

        })
        .finally(() => {
         
        });
    },

    updateContractAmendedStatus() {
      const params = {
        method: "PUT",
        body: JSON.stringify({}),
      };
      const url = `/my_contracts/${this.contract}/contract-amended`;

      api.fetch(url, params)
        .then(data => {
          this.loadContractStatus();
        })
        .catch(e => {
 
        })
        .finally(() => {

        });
    },

    saveContract() {
      const novoConteudoHTML = this.htmlContract;

      this.isLoading = true;

      const url = `/contracts/${this.contract}/change`;
      const params = {
        method: "PUT",
        body: JSON.stringify({ htmlContent: novoConteudoHTML }),
      };

      api.fetch(url, params)
        .then(data => {
          if (data.response && data.response.success && data.response.data.contractId) {
            this.$q.notify({
              message: "Contrato atualizado com sucesso",
              position: "bottom",
              type: "positive",
            });
            this.loadDocument();
          } else {
            throw new Error("Erro ao atualizar o contrato");
          }
        })
        .catch(error => {
          console.error('Erro ao salvar contrato:', error);
          return error.message;
        })
        .finally(() => {
          this.isLoading = false;
          this.isEditing = false;
        });
    },

    statusIsWaitingForSignature() {
      return this.contract_s && this.contract_s.status === "Waiting signatures";
    },

    requestSignatures() {
      if (this.contract !== null) {        
        this.isRequesting = true;

        const params = {
          method: "PUT",
          body: {},
        };

        const url = `/my_contracts/${this.contract}/request-signatures`;

        api.fetch(url, params)
        .then((response) => {
          this.$q.notify({
            message: "Solicitação de assinatura enviada com sucesso",
            position: "bottom",
            type: "positive",
          });

          this.loadContractStatus();
        })
        .catch((e) => {
          this.$q.notify({
            message: "Erro ao solicitar assinaturas, verifique o cadastro do cliente!",
            position: "bottom",
            type: "negative",
          })
        })
        .finally(() => {
            this.loadContractStatus();
            this.isRequesting = false;
        });
      }
    },

  },
  computed: {
    ...mapGetters({
      currentCompany: "people/currentCompany",
      defaultCompany: "people/defaultCompany",
      myCompany: "people/currentCompany",
    }),

    logged() {
      return this.$store.getters["auth/user"];
    },

    statusStyle() {
      let style = "text-center text-h6 rounded-borders q-pl-sm q-pr-sm ";

      if (this.contractStatus) {
        switch (this.contractStatus) {
          case "Draft":
            style += "bg-blue text-white";
            break;
          case "Waiting approval":
          case "Waiting signatures":
            style += "bg-yellow text-black";
            break;
          case "Active":
            style += "bg-green text-white";
            break;
          case "Canceled":
          case "Amended":
            style += "bg-red text-white";
            break;
          default:
            style += "text-black";
        }
      } else {
        style += "text-black";
      }

      return style;
    }
  },
};
</script>

<style lang="sass">
.demonstrativa
  margin-right: 10px

.contract-document
  margin-top: 20px
  overflow: auto
  text-align: justify

  & div
    max-width: 100%
</style>
