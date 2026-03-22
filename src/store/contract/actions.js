import { api } from '@controleonline/ui-common/src/api';

import * as types from '@controleonline/ui-default/src/store/default/mutation_types';

export const generate = ({ commit, getters }, params) => {
  let id = params.id;
  delete params.id;

  let options = {
    method: 'POST',
    body: params,
  };
  commit(types.SET_ISSAVING, true);
  return api
    .fetch('/contracts/' + id + '/generate', options)
    .then(data => {
      return data;
    })
    .catch(e => {
      commit(types.SET_ERROR, e.message);
      throw e;
    })
    .finally(e => {
      commit(types.SET_ISSAVING, false);
    });
};

export const sign = ({ commit, getters }, params) => {
  let id = params.id;
  delete params.id;

  let options = {
    method: 'POST',
    body: params,
  };
  commit(types.SET_ISSAVING, true);
  return api
    .fetch('/contracts/' + id + '/sign', options)
    .then(data => {
      return data;
    })
    .catch(e => {
      commit(types.SET_ERROR, e.message);
      throw e;
    })
    .finally(e => {
      commit(types.SET_ISSAVING, false);
    });
};

export const getFileContent = ({ commit, getters }, params) => {
  let id = params.id;
  delete params.id;

  let options = {
    method: 'GET',
  };
  commit(types.SET_ISSAVING, true);
  return api
    .fetch(params, options)
    .then(data => {
      return data;
    })
    .catch(e => {
      commit(types.SET_ERROR, e.message);
      throw e;
    })
    .finally(e => {
      commit(types.SET_ISSAVING, false);
    });
};

export const saveFileContent = ({ commit, getters }, params) => {
  let id = params.id;
  let content = params.content;

  let body = {
    contract_html: content
  };

  let options = {
    method: 'PUT',
    body: body,
  };
  commit(types.SET_ISSAVING, true);
  return api
    .fetch('/contracts/' + id, options)
    .then(data => {
      return data;
    })
    .catch(e => {
      commit(types.SET_ERROR, e.message);
      throw e;
    })
    .finally(e => {
      commit(types.SET_ISSAVING, false);
    });
};
