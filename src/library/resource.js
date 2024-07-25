/**
 * Resource class.
 *
 * @constructor
 * @param {Client} client
 * @param {String} resourceId
 * @param {String} operation
 * @param {bool}   isPrivate
 * @param {bool}   isFake
 */

const emptyPromise = function(config) {
  console.log('Executing:', config.operation, config.resourceId);

  return new Promise(
   function(resolve, reject) {
     window.setTimeout(
       function() {
         resolve()
       },
       Math.random() * 2000 + 1000
     );
   }
  )
};

export default class Resource {
  constructor(client, resourceId, operation, isPrivate, isFake = false) {
    this.client     = client;
    this.resourceId = resourceId;
    this.operation  = operation;
    this.isPrivate  = isPrivate;
    this.isFake     = isFake;
  }

  fetch(options) {
    let _options = {
      method: this.operation,
    };

    if (this.isFake) {
      return emptyPromise({
        operation : this.operation,
        resourceId: this.resourceId,
      });
    }

    if (options.query) {
      _options.params = options.query;
    }

    if (options.payload) {
      _options.body = (options.payload);
    }

    let endpoint = this.resourceId;

    if (options.params) {
      Object.keys(options.params)
        .forEach((paramKey) => {
          endpoint = endpoint
            .replace(
              new RegExp(`\{${paramKey}\}`, 'ig'), options.params[paramKey]
            )
          ;
        });
    }

    return this.client[this.isPrivate ? 'private' : 'public'](endpoint, _options);
  }
}
