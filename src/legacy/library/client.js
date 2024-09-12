
/**
 * Client class.
 *
 * @constructor
 * @param {String} baseEndpoint
 * @param {String} token
 */

export default class Client {
  constructor(baseEndpoint, token = null) {
    this.endpoint = baseEndpoint;
    this.token    = token;
  }

  private(resourceId, options = {}) {
    if (this.token === null)
      throw Error('API: token is not defined');

    if (typeof options.headers === 'undefined')
      Object.assign(options, { headers: new Headers() });

    options.headers.set(
      'API-TOKEN', this.token
    );

    return api.fetch(this.endpoint, resourceId, options);
  }

  public(resourceId, options = {}) {
    return api.fetch(this.endpoint, resourceId, options);
  }
}
