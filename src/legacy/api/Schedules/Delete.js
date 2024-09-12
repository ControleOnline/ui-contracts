 import Resource from '../../library/resource';

export default class Delete extends Resource {
  constructor(client) {
    super(client, '/school_team_schedules/{id}', 'DELETE', true)
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
