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
  name  : 'ContractScheduleList',
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
        name  : 'students',
        field : 'students',
        align : 'left',
        label : this.$t('contracts.columns.student'),
        format: (val) => {
          return val.join(', ')
        }
      },
      {
        name : 'weekDay',
        field: 'weekDay',
        align: 'left',
        label: this.$t('contracts.columns.week_days'),
      },
      {
        name : 'startTime',
        field: 'startTime',
        align: 'left',
        label: this.$t('contracts.columns.start_time'),
      },
      {
        name : 'endTime',
        field: 'endTime',
        align: 'left',
        label: this.$t('contracts.columns.end_time'),
      },
      {
        name : 'trainer',
        field: 'trainer',
        align: 'left',
        label: this.$t('contracts.columns.teacher'),
      },
      {
        name : 'local',
        field: 'local',
        align: 'left',
        label: this.$t('contracts.columns.local'),
      },
      {
        name : 'remove'
      },
    ];

    this.allDays = {
      'monday'   : this.$t('contracts.monday'),
      'tuesday'  : this.$t('contracts.tuesday'),
      'wednesday': this.$t('contracts.wednesday'),
      'thursday' : this.$t('contracts.thursday'),
      'friday'   : this.$t('contracts.friday'),
      'saturday' : this.$t('contracts.saturday'),
      'sunday'   : this.$t('contracts.sunday'),
    };

    this.classType = {
      'ead'    : this.$t('contracts.ead'),
      'company': this.$t('contracts.company'),
      'school' : this.$t('contracts.school'),
    };

    this.onRequest({
      pagination: this.pagination,
      filter    : this.filters,
    });
  },

  data() {
    return {
      columns   : [],
      allDays   : {},
      classType : {},
      data      : [],
      isLoading : false,
      pagination: {
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

      let {
          page,
          rowsPerPage,
          rowsNumber,
          sortBy,
          descending
      } = props.pagination;

      this.isLoading = true;

      this.Api.Schedules
        .GetAll({
          query: {
            itemsPerPage   : rowsPerPage,
            page           : page,
            'team.contract': this.contract.id,
          }
        })
          .then((schedule) => {
              let items = [];

              for (let index in schedule.members) {
                let item = schedule.members[index];

                items.push({
                  'id'       : item['@id'].replace(/\D/g, ''),
                  'students' : item.team.peopleTeams
                    .filter((peopleTeam) => {
                      return peopleTeam.peopleType === 'student'
                    })
                    .map   ((peopleTeam) => {
                      return `${peopleTeam.people.name} ${peopleTeam.people.alias}`;
                    }),
                  'weekDay'  : this.allDays[item.weekDay],
                  'startTime': this.$formatter.formatBRPostalCode(item.startTime),
                  'endTime'  : this.$formatter.formatBRPostalCode(item.endTime  ),
                  'trainer'  : `${item.peopleTrainer.trainer.name} ${item.peopleTrainer.trainer.alias}`,
                  'local'    : this.classType[item.team.type] || '-',
                  '_bussy'   : false,
                });
              }

              this.data = items;

              return {
                members: items,
                total  : schedule.total,
              }
          })
          .then((schedule) => {
            this.pagination.page        = page;
            this.pagination.rowsPerPage = rowsPerPage;
            this.pagination.sortBy      = sortBy;
            this.pagination.descending  = descending;
            this.pagination.rowsNumber  = schedule.total;
          })
          .finally(() => {
            this.isLoading = false;
          });
    },

    removeItem(item) {
      if (window.confirm(this.$t('messages.sure_remove'))) {
        item._bussy = true;
        this.Api.Schedules
          .Delete({
            params: { id: item.id }
          })
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
