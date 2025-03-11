 import Resource from '../../library/resource';

export default class GetDocument extends Resource {
  constructor(client) {
    super(client, '/my_contracts/{id}/document', 'GET', true)
  }

  fetch(options) {
    return super.fetch(options)
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        else {
          return response
            .then(responseJson => {
              throw new Error('Unknown error');
            });
        }
      });
  }
}
