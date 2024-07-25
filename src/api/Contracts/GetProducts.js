 import Resource from '../../library/resource';

export default class GetProducts extends Resource {
  constructor(client) {
    super(client, '/my_contracts/{id}/products', 'GET', true)
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
      });
  }
}
