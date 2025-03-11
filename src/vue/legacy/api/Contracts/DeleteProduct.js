 import Resource from '../../library/resource';

export default class DeleteProduct extends Resource {
  constructor(client) {
    super(client, '/my_contract_products/{id}', 'DELETE', true)
  }

  fetch(options) {
    return super.fetch(options)
      .then((response) => {
        if (response.ok) {
          return true;
        }
        else {
          return response
            .then(responseJson => {
              if (responseJson['@type'] === 'hydra:Error') {
                let message = responseJson['hydra:description'];

                throw new Error(message);
              }

              throw new Error('Unknown error');
            });
        }
      });
  }
}
