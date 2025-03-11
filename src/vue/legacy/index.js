import ActionAmend from "./components/ActionAmend";
import ActionCancel from "./components/ActionCancel";
import ActionParticipant from "./components/ActionParticipant";
import ActionProduct from "./components/ActionProduct";
import ActionSchedule from "./components/ActionSchedule";
import ContractDetail from "./components/ContractDetail";
import ContractDocument from "./components/ContractDocument";
import ContractForm from "./components/ContractForm";
import ContractList from "./components/ContractList";
import ContractNav from "./components/ContractNav";
import ParticipantList from "./components/ParticipantList";
import ProductList from "./components/ProductList";
import ScheduleList from "./components/ScheduleList";

export {
  ActionAmend,
  ActionCancel,
  ActionParticipant,
  ActionProduct,
  ActionSchedule,
  ContractDetail,
  ContractDocument,
  ContractForm,
  ContractList,
  ContractNav,
  ParticipantList,
  ProductList,
  ScheduleList,
};

export default {
  ContractList,
  ContractForm,
  ContractNav,
  ContractDetail,
  ActionCancel,
  ActionAmend,
  ActionParticipant,
  ParticipantList,
  ProductList,
  ActionProduct,
  ContractDocument,
  ScheduleList,
  ActionSchedule,

  install(Vue) {
    Vue.component(ContractList.name, ContractList);
    Vue.component(ContractForm.name, ContractForm);
    Vue.component(ContractNav.name, ContractNav);
    Vue.component(ContractDetail.name, ContractDetail);
    Vue.component(ActionCancel.name, ActionCancel);
    Vue.component(ActionAmend.name, ActionAmend);
    Vue.component(ActionParticipant.name, ActionParticipant);
    Vue.component(ParticipantList.name, ParticipantList);
    Vue.component(ProductList.name, ProductList);
    Vue.component(ActionProduct.name, ActionProduct);
    Vue.component(ContractDocument.name, ContractDocument);
    Vue.component(ScheduleList.name, ScheduleList);
    Vue.component(ActionSchedule.name, ActionSchedule);
  },
};
