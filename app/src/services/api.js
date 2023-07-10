import fetchRetry from "fetch-retry";
import { apiURL } from "../config";
import { createFormDataForFileUpload } from "snu-lib";
import { capture } from "../sentry";

let fetch = window.fetch;

class api {
  constructor() {
    this.token = "";
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
  }

  checkToken() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}/young/signin_token`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        capture(e);
        reject(e);
      }
    });
  }
  esQuery(index, body) {
    const header = { index, type: "_doc" };
    return fetch(`${apiURL}/es/${index}/_msearch`, {
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      mode: "cors",
      method: "POST",
      redirect: "follow",
      referrer: "no-referrer",
      headers: { "Content-Type": "application/x-ndjson", Authorization: `JWT ${this.token}` },
      body: [header, body].map((e) => `${JSON.stringify(e)}\n`).join(""),
    })
      .then((response) => {
        if (response.ok === false && response.status === 401) {
          if (window?.location?.pathname !== "/auth") window.location.href = "/auth?disconnected=1";
          // We need to return responses to prevent the promise from rejecting.
          return { responses: [] };
        }
        return response.json();
      })
      .catch((e) => {
        capture(e, { extra: { body: body } });
        console.error(e);
        return { responses: [] };
      });
  }

  getTotal(response) {
    return (response && response.hits && response.hits.total) || 0;
  }

  getHits(response) {
    return (response && response.hits && response.hits.hits) || [];
  }

  getAggregations(response) {
    try {
      if (!response || !response.aggregations) return {};
      const keys = Object.keys(response.aggregations);
      if (!keys.length) return {};

      if (response.aggregations[keys[0]].value !== undefined) return response.aggregations[keys[0]].value;

      let obj = {};
      for (let i = 0; i < response.aggregations[keys[0]].buckets.length; i++) {
        obj[response.aggregations[keys[0]].buckets[i].key] = response.aggregations[keys[0]].buckets[i].doc_count;
      }
      return obj;
    } catch (e) {
      capture(e);
      return;
    }
  }

  openpdf(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });
        if (response.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        if (response.status !== 200) return reject();
        const file = await response.blob();
        resolve(file);
      } catch (e) {
        capture(e, { extra: { body: body, path: path } });
        reject(e);
      }
    });
  }

  get(path) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        });
        if (response.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        capture(e, { extra: { path: path } });
        reject(e);
      }
    });
  }

  put(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });
        if (response.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        capture(e, { extra: { path: path, body: body } });
        reject(e);
      }
    });
  }

  uploadFiles(path, arr) {
    const formData = createFormDataForFileUpload(arr);
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { Authorization: `JWT ${this.token}` },
          body: formData,
        });
        if (response.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        capture(e, { extra: { path: path, arr: arr } });
        reject(e);
      }
    });
  }

  remove(path) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          credentials: "include",
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        });
        if (response.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        capture(e, { extra: { path: path } });
        reject(e);
      }
    });
  }

  post(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });
        if (response.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        if (response.status !== 200) {
          return reject(res);
        }
        resolve(res);
      } catch (e) {
        capture(e, { extra: { path: path, body: body } });
        reject(e);
      }
    });
  }
}

function initApi() {
  fetch = fetchRetry(window.fetch);
}

const API = new api();
export default API;

export { initApi };
