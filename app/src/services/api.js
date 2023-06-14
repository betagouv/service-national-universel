import "isomorphic-fetch";
import fetchRetry from "fetch-retry";
import { apiURL } from "../config";
import * as Sentry from "@sentry/react";

let fetch = window.fetch;

function jsonOrRedirectToSignIn(response) {
  if (response.ok === false && response.status === 401) {
    if (window && window.location && window.location.href) {
      window.location.href = "/auth?disconnected=1";
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
    if (window && window.location && window.location.href) {
      window.location.href = "/auth?unauthorized=1";
    }
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
      .then((r) => jsonOrRedirectToSignIn(r))
      .catch((e) => {
        Sentry.captureException(e);
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
          this.goToAuth();
        }
        if (response.status !== 200) return reject();
        const file = await response.blob();
        resolve(file);
      } catch (e) {
        console.log(e);
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

  uploadFile(path, arr) {
    const names = arr.map((e) => e.name || e);
    const files = arr.filter((e) => typeof e === "object");
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const safeFilename = encodeURIComponent(files[i].name.replace(/'/g, ""));
      formData.append(files[i].name, files[i], safeFilename);
    }
    formData.append("body", JSON.stringify({ names }));
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
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  uploadID(youngId, file, metadata = {}) {
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
