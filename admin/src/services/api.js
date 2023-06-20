import fetchRetry from "fetch-retry";
import "isomorphic-fetch";

import * as Sentry from "@sentry/react";
import { apiURL } from "../config";

let fetch = window.fetch;

const exceptionToRedirect = "/auth";

function jsonOrRedirectToSignIn(response) {
  if (response.ok === false && response.status === 401) {
    if (window?.location?.pathname?.indexOf(exceptionToRedirect) === -1) {
      window.location.href = "/auth?unauthorized=1";
      // We need to return responses to prevent the promise from rejecting.
      return { responses: [] };
    }
  }
  return response.json();
}

class api {
  constructor() {
    this.token = "";
  }

  goToAuth() {
    if (window?.location?.pathname?.indexOf(exceptionToRedirect) === -1) {
      return (window.location.href = "/auth?unauthorized=1");
    }
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
  }

  checkToken() {
    if (!this.token) return Promise.resolve({ ok: false });
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch("/referent/signin_token", {
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
        reject(e);
      }
    });
  }

  esQuery(index, body, route = null, queryParam = "") {
    if (!this.token) return Promise.resolve({ ok: false });

    const header = { index, type: "_doc" };
    return fetch(`${apiURL}/es/${route || index}/_msearch${queryParam}`, {
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
      .then((r) => jsonOrRedirectToSignIn(r))
      .catch((e) => {
        Sentry.captureException(e);
        console.error(e);
        return { responses: [] };
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

  async openpdf(path, body) {
    if (!this.token) return Promise.resolve({ ok: false });
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
      this.goToAuth();
    }
    if (response.status !== 200) {
      throw await response.json();
    }
    return response.blob();
  }

  get(path) {
    if (!this.token) return Promise.resolve({ ok: false });
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
          this.goToAuth();
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  put(path, body) {
    if (!this.token) return Promise.resolve({ ok: false });
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
          this.goToAuth();
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  putFormData(path, body, files) {
    if (!this.token) return Promise.resolve({ ok: false });
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i], files[i].name);
    }
    formData.append("body", JSON.stringify(body));

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { Authorization: `JWT ${this.token}` },
          body: formData,
        });
        if (response.status === 401) {
          this.goToAuth();
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  postFormData(path, body, files) {
    if (!this.token) return Promise.resolve({ ok: false });
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i], files[i].name);
    }
    formData.append("body", JSON.stringify(body));

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: {},
          body: formData,
        });
        if (response.status === 401) {
          this.goToAuth();
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  remove(path) {
    if (!this.token) return Promise.resolve({ ok: false });
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
          this.goToAuth();
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  uploadFile(path, arr, properties) {
    if (!this.token) return Promise.resolve({ ok: false });
    const names = arr.map((e) => e.name || e);
    const files = arr.filter((e) => typeof e === "object");
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const safeFilename = encodeURIComponent(files[i].name.replace(/'/g, ""));
      formData.append(files[i].name, files[i], safeFilename);
    }
    let allData = properties ? { names, ...properties } : { names };
    formData.append("body", JSON.stringify(allData));
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
          this.goToAuth();
        }
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

  uploadID(youngId, file, metadata = {}) {
    if (!this.token) return Promise.resolve({ ok: false });
    let formData = new FormData();
    const safeFilename = encodeURIComponent(file.name.replace(/'/g, ""));
    formData.append("file", file, safeFilename);
    for (const [key, value] of Object.entries(metadata)) {
      formData.append(key, value);
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}/young/${youngId}/documents/cniFiles`, {
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
          this.goToAuth();
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  post(path, body) {
    if (!this.token) return Promise.resolve({ ok: false });
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

        if (response.status === 401 && window.location.href.indexOf("/auth") === -1) {
          this.goToAuth();
        }
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
function initApi() {
  fetch = fetchRetry(window.fetch);
}

const API = new api();
export default API;

export { initApi };
