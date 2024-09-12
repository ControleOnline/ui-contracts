import { api } from "@controleonline/../../src/boot/api";
import filters from './filters';
import params from './params';
import routes from './routes';

export default {
  mixins: [ api, filters, routes, params ],

  props : {
    config: {
      type    : Function,
      required: false,
      default : function() { }
    },
  },

  created() {
    this.config({
      Api   : this.Api,
      Routes: this.Routes,
      Params: this.Params,
    });
  },
}
