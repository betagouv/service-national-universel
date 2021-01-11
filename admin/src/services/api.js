import "isomorphic-fetch";

import { apiURL } from "../config";

class api {
  constructor() {
    this.token = "";
  }

  getToken() {
    return this.token;
  }

  esQuery(queries) {
    let query = "";
    for (let i = 0; i < queries.length; i++) {
      query += `${JSON.stringify(queries[i])}\n`;
    }

    return fetch(`${apiURL}/es/_msearch`, {
      mode: "cors",
      method: "POST",
      redirect: "follow",
      referrer: "no-referrer",
      headers: { "Content-Type": "application/x-ndjson", Authorization: `JWT ${this.token}` },
      body: query,
    })
      .then((r) => r.json())
      .catch((e) => {
        console.log(e);
      });
  }

  getTotal(response) {
    return (response && response.hits && response.hits.total && response.hits.total.value) || 0;
  }

  getHits(response) {
    return (response && response.hits && response.hits.hits) || [];
  }

  getAggregations(response) {
    if (!response || !response.aggregations) return {};
    const keys = Object.keys(response.aggregations);
    if (!keys.length) return {};

    if (response.aggregations[keys[0]].value !== undefined) return response.aggregations[keys[0]].value;

    let obj = {};
    for (let i = 0; i < response.aggregations[keys[0]].buckets.length; i++) {
      obj[response.aggregations[keys[0]].buckets[i].key] = response.aggregations[keys[0]].buckets[i].doc_count;
    }
    return obj;
  }

  setToken(token) {
    this.token = token;
  }
  getToken() {
    return this.token;
  }

  get(path) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        });

        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  put(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });

        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  putFormData(path, body, files) {
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i], files[i].name);
    }
    formData.append("body", JSON.stringify(body));

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { Authorization: `JWT ${this.token}` },
          body: formData,
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  postFormData(path, body, files) {
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i], files[i].name);
    }
    formData.append("body", JSON.stringify(body));

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: {},
          body: formData,
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  remove(path) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          credentials: "include",
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  post(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });

        const res = await response.json();
        if (response.status !== 200) {
          return reject(res);
        }
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
}

const API = new api();
export default API;
