<template>
  <q-table
    :loading        ="isLoading"
    :rows           ="data"
    :columns        ="columns"
    v-model:pagination="pagination"
    @request        ="onRequest"
    row-key         ="id"
  >
    <template v-slot:body-cell-remove="props">
      <q-td auto-width>
        <q-btn flat round dense
          color   ="red"
          icon    ="delete"
          @click  ="removeItem(props.row)"
          :disable="readOnly"
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
  name  : 'ContractProductList',
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
        label: this.$t('contracts.columns.product_name')
      },
      {
        name : 'quantity',
        field: 'quantity',
        align: 'left',
        label: this.$t('contracts.columns.quantity')
      },
      {
        name : 'price',
        field: 'price',
        align: 'left',
        label: this.$t('contracts.columns.price')
      },
      {
        name : 'payer',
        field: 'payer',
        align: 'left',
        label: this.$t('contracts.columns.payer')
      },
      {
        name : 'parcels',
        field: 'parcels',
        align: 'left',
        label: this.$t('contracts.columns.parceled')
      },
      {
        name : 'remove'
      }
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
        sortBy     : 'name',
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
        query['myCompany']  = this.Params.Company.get();
        query['myProvider'] = this.Params.Company.get();
      }

      // do request

      this.isLoading = true;

      this.Api.Contracts
        .GetProducts({
          query,
          params: {
            id: this.contract.id,
          },
        })
          .then((products) => {
            if (!products) {
              throw new Error('No products');
            }

            let data = [];

            if (products != null) {
              for (let i in products.members) {

                data.push({
                  'id'      : products.members[i].id,
                  'name'    : products.members[i].product_name,
                  'quantity': products.members[i].quantity,
                  'price'   : formatBRMoney(products.members[i].product_price, 'BRL', 'pt-br'),
                  'payer'   : products.members[i].payer_name === null ? '-' : products.members[i].payer_name,
                  'parcels' : products.members[i].parcels == 0 ? '-' : `${products.members[i].parcels}x`,
                  '_bussy'  : false,
                });
              }
            }

            return {
              members: data,
              total  : products.total
            };
          })
          .then((products) => {
            this.data = products.members;

            return {
              members: products.members,
              total  : products.total
            };
          })
          .then((products) => {
            this.pagination.rowsNumber  = products.total;
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
          .DeleteProduct({ params: { id: item.id }})
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
