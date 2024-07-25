<template>
  <div>
    
    <div v-if="pageLoading" class="row">
      <div class="col-12 pageloader">
        <q-spinner
          color="primary"
          class="q-uploader__spinner"
        />
      </div>
    </div>

    <q-table
      v-else
      :loading        ="isLoading"
      :rows           ="data"
      :columns        ="columns"
      v-model:pagination="pagination"
      @request        ="onRequest"
      row-key         ="id"
      style           ="min-height: 90vh;"
    >
      <template v-slot:top>
        <div class="col-3 q-mb-md text-h6">
          {{ $t('contracts.title') }}
        </div>
        <div class="col-9 q-mb-md">
          <div class="row justify-end">
            <q-btn flat
              :label  ="$t('contracts.new_contract')"
              icon    ="add"
              color   ="primary"
              class   ="q-ml-sm"
              @click  ="onCreate"
              :loading="isCreating"
            />
          </div>
        </div>

        <div class="col-sm-6 col-xs-12 q-pa-md">
          <q-input
      dense
      outlined stack-label
            :label      ="$t('contracts.search_by')"
            debounce    ="1000"
            v-model     ="filters.text"
            class       ="full-width"
            :placeholder="$t('contracts.search_phold')"
          />
        </div>
        <div class="col-sm-6 col-xs-12 q-pa-md">
          <q-select dense outlined  stack-label
            :label  ="$t('contracts.status')"
            v-model ="filters.status"
            :options="statuses"
            class   ="full-width"
          />
        </div>
      </template>

      <template v-slot:body-cell-id="props">
        <q-td key="id">
          <q-btn dense
            :to   ="Routes.Details.get(props.row.id)"
            :label="props.value"
            class ="full-width"
          />
        </q-td>
      </template>
    </q-table>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import configurable from '../mixins/configurable';

export default {
  name  : 'ContractList',
  mixins: [ configurable ],

  computed: {
    ...mapGetters({
      defaultCompany : 'people/defaultCompany',
      cegCreateRoute : 'contracts/cegCreateRoute',
    })
  },

  created() {

    if (this.defaultCompany) {
      this.pageLoading = false;
    }

    this.columns = [
      {
        name  : 'id',
        field : 'id',
        align : 'left',
        format: (val) => {
          return `#${val}`;
        },
        label : this.$t('contracts.columns.id')
      },
      {
        name : 'beneficiario',
        align: 'left',
        field: 'beneficiario',
        label: this.$t('contracts.columns.contratante')
      },
      {
        name  : 'dataInicio',
        field : 'dataInicio',
        align : 'left',
        label : this.$t('contracts.columns.data_inicio'),
        format: (val) => {
          return this.$formatter.formatDateYmdTodmY(val);
        }
      },
      {
        name  : 'dataFim',
        field : 'dataFim',
        align : 'left',
        label: this.$t('contracts.columns.data_fim'),
        format: (val) => {
          return this.$formatter.formatDateYmdTodmY(val);
        }
      },
      {
        name : 'status',
        field: 'status',
        align: 'left',
        label: this.$t('contracts.columns.status'),
        format: (val) => {
          return this.$t(`contracts.statuses.${val}`)
        }
      },
    ];

    this.statuses = [
        {
          'label': this.$t('contracts.all'),
          'value': -1
        },
        {
          'label': this.$t(`contracts.statuses.${'Draft'}`),
          'value': 'Draft'
        },
        {
          'label': this.$t(`contracts.statuses.${'Waiting approval'}`),
          'value': 'Waiting approval'
        },
        {
          'label': this.$t(`contracts.statuses.${'Waiting signatures'}`),
          'value': 'Waiting signatures'
        },
        {
          'label': this.$t(`contracts.statuses.${'Active'}`),
          'value': 'Active'
        },
        {
          'label': this.$t(`contracts.statuses.${'Canceled'}`),
          'value': 'Canceled'
        },
        {
          'label': this.$t(`contracts.statuses.${'Amended'}`),
          'value': 'Amended'
        },
    ];

    this.onRequest({
      pagination: this.pagination,
      filter    : this.filters,
    });
  },

  data() {
    return {
      pageLoading : true,
      columns     : [],
      statuses    : [],
      data        : [],
      isCreating  : false,
      isLoading   : false,
      filters     : {
        text   : null,
        status : null,
      },
      pagination: {
        sortBy     : 'dataInicio',
        descending : false,
        page       : 1,
        rowsPerPage: 20,
        rowsNumber : 10,
      },
    }
  },

  watch: {
    defaultCompany(data) {
      if (data) {
        this.pageLoading = false;
      }
    },

    'filters.text'() {
      this.onRequest({
        pagination: this.pagination,
        filter    : this.filters,
      });
    },

    'filters.status'() {
      this.onRequest({
        pagination: this.pagination,
        filter    : this.filters,
      });
    },
  },

  methods: {    

    onCreate() {      
        if (!this.Params.Company.get()) {
          this.$q.notify({
            message : this.$t('contracts.errors.no_company'),
            position: 'bottom',
            type    : 'negative',
          });
          return;
        }

        this.isCreating = true;
        this.Api.Contracts
          .Create({
            payload: {},
            query  : {
              myProvider: this.Params.Company.get()
            }
          })
            .then((contract) => {
              if (contract['@id']) {
                this.$router.push(
                  this.Routes.Details.get(contract['@id'].replace(/\D/g, ''))
                );
              }
            })
            .catch((error) => {
              this.$q.notify({
                message : this.$t(error.message),
                position: 'bottom',
                type    : 'negative',
              });
            })
            .finally(() => {
              this.isCreating = false;
            });      
    },

    onRequest(props) {
      if (this.isLoading)
        return;

      // prepare request params

      let {
          page,
          rowsPerPage,
          rowsNumber,
          sortBy,
          descending
      }          = props.pagination;
      let filter = props.filter;
      let query  = { itemsPerPage: rowsPerPage, page };

      if (this.filters.text != null && this.filters.text.length > 0) {
        if (this.filters.text.length < 2)
          return;

        if (/^(\d{2})\/(\d{2})\/(\d{4})$/.test(this.filters.text)) {
          query['searchBy'] = this.filters.text.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/,"$3-$2-$1");
        }
        else {
          query['searchBy'] = this.filters.text;
        }
      }
      else {
        if (this.filters.status != null && this.filters.status.value != -1) {
          query['contractStatus'] = this.filters.status.value;
        }
      }

      if (this.Params.Company.get()) {
        query['myProvider'] = this.Params.Company.get();
        query['myCompany']  = this.Params.Company.get();
      }

      query['mycontract[startDate]'] = 'desc';

      // do request

      this.isLoading = true;
      this.Api.Contracts
        .GetAll({
          query
        })
          .then((contracts) => {
            if (!contracts) {
              throw new Error('No contracts');
            }

            let data = [];

            if (contracts != null) {
              for (let i in contracts.members) {
                let beneficiario = contracts.members[i].contractPeople
                  .find(people => people.peopleType == 'Beneficiary');

                data.push({
                  'id'          : contracts.members[i]['@id'].replace(/\D/g, ''),
                  'beneficiario': beneficiario ? beneficiario.people.name : '',
                  'dataInicio'  : contracts.members[i].startDate,
                  'dataFim'     : contracts.members[i].endDate,
                  'status'      : contracts.members[i].contractStatus,
                });
              }
            }

            return {
              members: data,
              total  : contracts.total
            };
          })
          .then((contracts) => {
            this.data = contracts.members;

            return {
              members: contracts.members,
              total  : contracts.total
            };
          })
          .then((contracts) => {
            this.pagination.rowsNumber  = contracts.total;
            this.pagination.page        = page;
            this.pagination.rowsPerPage = rowsPerPage;
            this.pagination.sortBy      = sortBy;
            this.pagination.descending  = descending;
          })
          .finally(() => {
            this.isLoading = false;
          })
      ;
    },
  },
};
</script>
