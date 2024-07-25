 import Resource from '../../library/resource';

export default class GetParticipants extends Resource {
  constructor(client) {
    super(client, '/my_contracts/{id}/contract_peoples', 'GET', true)
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
