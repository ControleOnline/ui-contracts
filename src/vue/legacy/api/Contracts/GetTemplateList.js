 import Resource from '../../library/resource';

export default class GetTemplateList extends Resource {
  constructor(client) {
    super(client, '/my_models', 'GET', true)
  }

  fetch(options) {
    return super.fetch(options)
      .then((response) => {
        if (response.ok) {
          return response
            .then(data => {
              if (data['member']) {
                return {
                  members: data['member'],
                  total  : data['totalItems']
                }
              }
              return null;
            });
        }
      });
  }
}
