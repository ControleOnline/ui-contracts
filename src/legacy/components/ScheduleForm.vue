<template>
  <q-form @submit="onSubmit" class="q-mt-sm" ref="myForm">
    <div class="row q-col-gutter-sm">
      <div class="col-xs-12">
        <q-select
          dense
          outlined
          multiple
          use-chips
          stack-label
          emit-value
          map-options
          v-model="students"
          :label="$t('contracts.students')"
          :options="studentsList"
          :rules="[isInvalid()]"
        />
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="weekDay"
          :label="$t('contracts.week_day')"
          :options="weekDays"
          :rules="[isInvalid()]"
        />
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="startTime"
          :label="$t('contracts.start_time')"
          :options="dayPeriods"
          :rules="[isInvalid()]"
        />
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="endTime"
          :label="$t('contracts.last_time')"
          :options="dayPeriods"
          :rules="[isInvalid()]"
        />
      </div>
      <div class="col-xs-12 col-sm-8">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="trainer"
          :label="$t('contracts.teacher')"
          :options="trainerList"
          :rules="[isInvalid()]"
        />
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="teamType"
          :label="$t('contracts.local')"
          :options="teamTypeList"
          :rules="[isInvalid()]"
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
  name: "ContractScheduleForm",
  mixins: [configurable, validation],

  props: {
    contract: {
      type: Contract,
      required: true,
    },
  },

  data() {
    return {
      isSaving: false,
      students: [],
      studentsList: [],
      weekDay: null,
      startTime: null,
      endTime: null,
      weekDays: [],
      trainer: [],
      trainerList: [],
      teamType: null,
      dayPeriods: [],
      teamTypeList: [],
    };
  },

  created() {
    this.teamTypeList = [
      {
        label: this.$t("contracts.school"),
        value: "school",
      },
      {
        label: this.$t("contracts.company"),
        value: "company",
      },
      {
        label: this.$t("contracts.ead"),
        value: "ead",
      },
    ];

    this.weekDays = [
      {
        label: this.$t("contracts.monday"),
        value: "monday",
      },
      {
        label: this.$t("contracts.tuesday"),
        value: "tuesday",
      },
      {
        label: this.$t("contracts.wednesday"),
        value: "wednesday",
      },
      {
        label: this.$t("contracts.thursday"),
        value: "thursday",
      },
      {
        label: this.$t("contracts.friday"),
        value: "friday",
      },
      {
        label: this.$t("contracts.saturday"),
        value: "saturday",
      },
      {
        label: this.$t("contracts.sunday"),
        value: "sunday",
      },
    ];

    this.dayPeriods = [
      {
        label: "07:00",
        value: "07:00:00",
      },
      {
        label: "07:30",
        value: "07:30:00",
      },
      {
        label: "08:00",
        value: "08:00:00",
      },
      {
        label: "08:30",
        value: "08:30:00",
      },
      {
        label: "09:00",
        value: "09:00:00",
      },
      {
        label: "09:30",
        value: "09:30:00",
      },
      {
        label: "10:00",
        value: "10:00:00",
      },
      {
        label: "10:30",
        value: "10:30:00",
      },
      {
        label: "11:00",
        value: "11:00:00",
      },
      {
        label: "11:30",
        value: "11:30:00",
      },
      {
        label: "12:00",
        value: "12:00:00",
      },
      {
        label: "12:30",
        value: "12:30:00",
      },
      {
        label: "13:00",
        value: "13:00:00",
      },
      {
        label: "13:30",
        value: "13:30:00",
      },
      {
        label: "14:00",
        value: "14:00:00",
      },
      {
        label: "14:30",
        value: "14:30:00",
      },
      {
        label: "15:00",
        value: "15:00:00",
      },
      {
        label: "15:30",
        value: "15:30:00",
      },
      {
        label: "16:00",
        value: "16:00:00",
      },
      {
        label: "16:30",
        value: "16:30:00",
      },
      {
        label: "17:00",
        value: "17:00:00",
      },
      {
        label: "17:30",
        value: "17:30:00",
      },
      {
        label: "18:00",
        value: "18:00:00",
      },
      {
        label: "18:30",
        value: "18:30:00",
      },
      {
        label: "19:00",
        value: "19:00:00",
      },
      {
        label: "19:30",
        value: "19:30:00",
      },
      {
        label: "20:00",
        value: "20:00:00",
      },
      {
        label: "20:30",
        value: "20:30:00",
      },
      {
        label: "21:00",
        value: "21:00:00",
      },
      {
        label: "21:30",
        value: "21:30:00",
      },
      {
        label: "22:00",
        value: "22:00:00",
      },
      {
        label: "22:30",
        value: "22:30:00",
      },
      {
        label: "23:00",
        value: "23:00:00",
      },
    ];

    this.loadStudents();
    this.loadTeachers();
  },

  methods: {
    onSubmit() {
      this.isSaving = true;

      this.Api.Schedules.Create({
        params: {
          id: this.contract.id,
        },
        query: {
          myCompany: this.Params.Company.get(),
          myProvider: this.Params.Company.get(),
        },
        payload: {
          teamType: this.teamType,
          students: this.students.map((id) => {
            return {
              peopleContractId: id,
            };
          }),
          peopleTrainerId: this.trainer,
          weekDay: this.weekDay,
          startTime: this.startTime,
          endTime: this.endTime,
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

    loadStudents() {
      this.Api.Contracts.GetParticipants({
        query: {
          peopleType: "Beneficiary",
        },
        params: {
          id: this.contract.id,
        },
      }).then((participants) => {
        if (participants != null) {
          let data = [];

          for (let i in participants.members) {
            data.push({
              label: `${participants.members[i].people.name} ${participants.members[i].people.alias}`,
              value: participants.members[i]["@id"].replace(/\D/g, ""),
            });
          }

          this.studentsList = data;
        }
      });
    },

    loadTeachers() {
      this.Api.Schedules.GetTrainers({
        query: {
          "company.id": this.Params.Company.get(),
        },
      }).then((teachers) => {
        if (teachers != null) {
          let data = [];

          for (let i in teachers.members) {
            data.push({
              label: `${teachers.members[i].trainer.name} ${teachers.members[i].trainer.alias}`,
              value: teachers.members[i]["@id"].replace(/\D/g, ""),
            });
          }

          this.trainerList = data;
        }
      });
    },
  },
};
</script>
