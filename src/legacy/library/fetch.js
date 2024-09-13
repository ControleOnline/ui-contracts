const MIME_TYPE = 'application/ld+json';

export default function(baseEndpoint, resourceId, options = {}) {
  if (typeof options.headers === 'undefined') {
    Object.assign(options, { headers: new Headers() });
  }

  if (options.headers.get('Accept') === null) {
    options.headers.set('Accept', MIME_TYPE);
  }

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    options.headers.get('Content-Type') === null
  ) {
    options.headers.set('Content-Type', MIME_TYPE);
  }

  if (options.params) {
    let params = [];

    Object.keys(options.params).map(key => {
      if (Array.isArray(options.params[key])) {
        params.push(options.params[key].map((value) => `${key}[]=${value}`).join('&'))
      }
      else {
        params.push(key + '=' + options.params[key]);
      }
    });

    resourceId = `${resourceId}?${params.join('&')}`;
  }

  const entryPoint = baseEndpoint + (baseEndpoint.endsWith('/') ? '' : '/');

  return api.fetch(new URL(resourceId, entryPoint), options)
    .then(response => {
      return response;
    });
}
