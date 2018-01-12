import * as qwest from 'qwest';
const base = 'http://localhost:3000/api/';
// const base = 'http://129.135.42.44:3000/api/';

export default {
  get: url => qwest.get(`${base}${url}`, null, { responseType: 'json'}).then(res => res.response),

  post: (url, data) => qwest.post(`${base}${url}`, data, { dataType: 'json', responseType: 'json'}).then(res => res.response),

  put: (url, data) => qwest.put(`${base}${url}`, data, { dataType: 'json', responseType: 'json'}).then(res => res.response),

  upload: (url, data) => qwest.post(`${base}${url}`, data, { dataType: 'formdata'}).then(res => res.response),

  del: (url, data) => qwest.delete(`${base}${url}`, data, { dataType: 'formdata'}).then(res => res.response)
};