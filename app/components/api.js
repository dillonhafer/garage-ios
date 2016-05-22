export function get(path) {
  return request('GET', path, '', {});
}

export function post(path, body, signature) {
  return request('POST', path, body, signature);
}

function request(verb, path, body, signature) {
  return fetch(path, Object.assign({
    method: verb,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      signature
    },
    body
  }));
}