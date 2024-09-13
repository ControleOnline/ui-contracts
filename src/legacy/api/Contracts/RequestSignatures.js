 import Errors from '../../library/errors';
import Resource from '../../library/resource';

export default class RequestSignatures extends Resource {
  constructor(client) {
    super(client, '/my_contracts/{id}/request-signatures', 'PUT', true)
  }

  fetch(options) {
    return super.fetch(options)
      .then((response) => {
        if (response.ok) {
          return response
            .then(data => {
              return data;
            });
        }
        else {
          return response
            .then(responseJson => {
              if (responseJson.response && responseJson.response.error) {
                throw new Errors.ValidationError(responseJson.response.error);
              } else
                if (responseJson['@type'] === 'hydra:Error') {
                  let message = responseJson['hydra:description'];

                  throw new Errors.ValidationError(message);
                }

              throw new Error('Unknown error');
            });
        }
      });
  }
}
