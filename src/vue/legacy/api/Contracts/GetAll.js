 import Resource from '../../library/resource';

export default class GetAll extends Resource {
  constructor(client) {
    super(client, '/my_contracts', 'GET', true)
  }

  fetch(options) {
    return super.fetch(options)
      .then((response) => {
        if (response.ok) {
          return response
            .then(data => {
              if (data['hydra:member']) {
                return {
                  members: data['hydra:member'],
                  total  : data['hydra:totalItems']
                }
              }
              return null;
            });
        }
      });
  }
}
