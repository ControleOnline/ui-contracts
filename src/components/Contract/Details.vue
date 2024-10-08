<template>
  <DefaultDetail
    :configs="configs"
    :id="contractId"
    @saved="saved"
    :key="key"
  />

  <q-card class="row">
    <template v-for="(multiline, name) in configs.multiline">
      <div class="col-12">
        <DefaultTable :configs="multiline" @saved="saved" />
      </div>
    </template>
  </q-card>

  <Html
    v-if="item && item.contractFile && item.contractFile.extension == 'html'"
    :readonly="false"
    :generatePDF="true"
    :data="item.contractFile"
    :key="key"
    @changed="changed"
    @converted="converted"
  />
  <iframe
    class="full-width"
    :style="{ height: '100vh !important' }"
    v-else-if="
      item && item.contractFile && item.contractFile.extension == 'pdf'
    "
    :src="$pdf(this.item.contractFile)"
  ></iframe>

  <div
    v-if="
      item &&
      item.contractFile &&
      item.contractFile.extension == 'pdf' &&
      item.status.realStatus != 'closed'
    "
    class="row justify-end q-pa-sm bg sticky-bottom full-width"
  >
    <q-btn
      v-if="!item.contractFile.docKey && item.status.realStatus == 'open'"
      icon="edit"
      :label="$tt('file', 'btn', 'edit')"
      color="primary"
      @click="generate"
    />
    <q-btn
      v-if="!item.contractFile.docKey && item.status.realStatus == 'open'"
      icon="save"
      :label="$tt('file', 'btn', 'sign')"
      color="primary"
      @click="sign"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Html from "@controleonline/ui-default/src/components/Default/Common/Inputs/Html.vue";
import DefaultDetail from "@controleonline/ui-default/src/components/Default/Common/DefaultDetail.vue";
import getConfigs from "./Configs";

export default {
  components: { DefaultDetail, Html },
  props: {
    context: {
      required: false,
      default: "contract",
    },
    contractId: {
      required: true,
    },
  },
  data() {
    return {
      key: 0,
      pdfBlobUrl: null,
    };
  },
  created() {
    this.$store.commit("contract_people/SET_FILTERS", {
      contract: "/contracts/" + this.contractId,
    });
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
    }),
    item() {
      return this.$store.getters["contract/item"];
    },
    configs() {
      let config = getConfigs(
        this.context,
        this.myCompany,
        this.$components,
        this.$store
      );
      return config;
    },
  },
  methods: {
    ...mapActions({
      generateContract: "contract/generate",
      signContract: "contract/sign",
    }),
    saved(data) {
      if (data && typeof data == "object" && data["@type"] == "Contract")
        this.$store.commit("contract/SET_ITEM", data);
      this.key++;
    },
    generate() {
      this.generateContract({ id: this.item.id }).then((data) => {
        this.saved(data);
      });
    },
    sign() {
      this.signContract({ id: this.item.id }).then((data) => {
        this.saved(data);
      });
    },
    converted(data) {
      let item = this.$copyObject(this.item);
      item.contractFile = data;
      this.$store.commit("contract/SET_ITEM", item);
    },
  },
};
</script>
