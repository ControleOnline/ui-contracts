<template>
  <q-table
    :loading        ="isLoading"
    :rows           ="data"
    :columns        ="columns"
    v-model:pagination="pagination"
    @request        ="onRequest"
    row-key         ="id"
  >
    <template v-slot:body-cell-name="props">
      <q-td>
        <q-btn dense          
          :to   ="{ name: 'CustomersDetails', params: { id: props.row.peopleId } }"
          :label="props.value"
          class ="full-width"
        />
      </q-td>
    </template>
    <template v-slot:body-cell-remove="props">
      <q-td auto-width>
        <q-btn flat round dense
          color   ="red"
          icon    ="delete"
          @click  ="removeItem(props.row)"
          :disable="props.row.isProvider || readOnly"
          :loading="props.row._bussy"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script>
 import Contract from '../entity/Contract';
import configurable from '../mixins/configurable';

export default {
  name  : 'ContractParticipantList',
  mixins: [ configurable ],

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
    this.columns = [
      {
        name : 'name',
        align: 'left',
        field: 'name',
        label: this.$t('contracts.columns.participant')
      },
      {
        name : 'roles',
        field: 'roles',
        align: 'left',
        label: this.$t('contracts.columns.participation')
      },
      {
        name : 'percentage',
        field: 'percentage',
        align: 'left',
        label: this.$t('contracts.columns.percent'),
        format: (val, row) => {
          return row.peopleType == 'Payer' ? `${val}%` : '-';
        },
      },
      {
        name : 'paymentDay',
        field: 'paymentDay',
        align: 'left',
        label: this.$t('contracts.columns.payment_day')
      },
      {
        name: 'remove'
      },
    ];

    this.onRequest({
      pagination: this.pagination,
      filter    : this.filters,
    });
  },

  data() {
    return {
      columns   : [],
      data      : [],
      isLoading : false,
      pagination: {
        sortBy     : 'dataInicio',
        descending : false,
        page       : 1,
        rowsPerPage: 20,
        rowsNumber : 10,
      },
    }
  },

  methods: {
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

      if (this.Params.Company.get() != null) {
        query['myCompany'] = this.Params.Company.get();
      }

      // do request

      this.isLoading = true;

      this.Api.Contracts
        .GetParticipants({
          query,
          params: {
            id: this.contract.id,
          },
        })
          .then((participants) => {
            if (!participants) {
              throw new Error('No participants');
            }

            let data = [];

            if (participants != null) {
              for (let i in participants.members) {

                data.push({
                  'id'        : participants.members[i]['@id'].replace(/\D/g, ''),
                  'name'      : participants.members[i].people.peopleType == 'J' ? `${participants.members[i].people.name} / ${participants.members[i].people.alias}` : `${participants.members[i].people.name} ${participants.members[i].people.alias}`,
                  'peopleId'  : participants.members[i].people['@id'].replace(/\D/g, ''),
                  'roles'     : this.$t(`contracts.roles.${participants.members[i].peopleType}`),
                  'percentage': participants.members[i].contractPercentage,
                  'paymentDay': participants.members[i].peopleType == 'Payer' ? `Dia ${participants.members[i].people.paymentTerm}` : '-',
                  'isProvider': participants.members[i].peopleType == 'Provider',
                  'peopleType': participants.members[i].peopleType,
                  '_bussy'    : false,
                });
              }
            }

            return {
              members: data,
              total  : participants.total
            };
          })
          .then((participants) => {
            this.data = participants.members;

            return {
              members: participants.members,
              total  : participants.total
            };
          })
          .then((participants) => {
            this.pagination.rowsNumber  = participants.total;
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

    removeItem(item) {
      if (window.confirm(this.$t('messages.sure_remove'))) {
        item._bussy = true;
        this.Api.Contracts
          .DeleteParticipant({ params: { id: item.id }})
            .then(isOk => {
              this.onRequest({
                pagination: this.pagination,
                filter    : this.filters,
              });
            })
            .catch(error => {
              this.$q.notify({
                message : this.$t(error.message),
                position: 'bottom',
                type    : 'negative',
              });
            })
            .finally(() => {
              item._bussy = false;
            })
          ;
      }
    },

    reload() {
      this.onRequest({
        pagination: this.pagination,
        filter    : this.filters,
      });
    },
  },
};
</script>
