import crypto from 'crypto-js';
import base64 from 'base-64';

export function authenticatedGet(path, sharedSecret) {
  const timestamp = Math.round(new Date().getTime()/1000);
  const signature = signString(timestamp, sharedSecret);
  return request('GET', path, signature, timestamp);
}

function request(verb, path, signature, timestamp) {
  return fetch(path, Object.assign({
    method: verb,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'signature': signature,
      'timestamp': timestamp
    }
  }));
}

function signString(string_to_sign, shared_secret) {
  const hmac = crypto.HmacSHA512(string_to_sign.toString(), shared_secret);
  return base64.encode(hmac)
}
