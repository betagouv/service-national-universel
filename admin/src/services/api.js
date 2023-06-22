import fetchRetry from "fetch-retry";
import "isomorphic-fetch";

import * as Sentry from "@sentry/react";
import { apiURL } from "../config";

let fetch = window.fetch;

class api {
  constructor() {
    this.token = "";
  }

  goToAuth() {
    if (window?.location?.pathname !== "/auth") return (window.location.href = "/auth?unauthorized=1");
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
        const response = await fetch(`${apiURL}/referent/signin_token`, {
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
        Sentry.captureException(e);
        reject(e);
      }
    });
  }

  esQuery(index, body, route = null, queryParam = "") {
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
      .then((response) => {
        if (response.ok === false && response.status === 401) {
          if (window?.location?.pathname !== "/auth") window.location.href = "/auth?unauthorized=1";
          return { responses: [] };
        }
        return response.json();
      })
      .catch((e) => {
        Sentry.setContext("body", body);
        Sentry.setContext("route", route);
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
          throw new Error("Unauthorized, redirecting...");
        }
      }
      if (response.status !== 200) {
        throw await response.json();
      }
      return response.blob();
    } catch (e) {
      Sentry.setContext("path", path);
      Sentry.setContext("body", body);
      Sentry.captureException(e);
      reject(e);
    }
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
        Sentry.setContext("path", path);
        Sentry.captureException(e);
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
        Sentry.setContext("path", path);
        Sentry.setContext("body", body);
        Sentry.captureException(e);
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
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        Sentry.setContext("path", path);
        Sentry.setContext("body", body);
        Sentry.captureException(e);
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
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        Sentry.setContext("path", path);
        Sentry.setContext("body", body);
        Sentry.captureException(e);
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
        Sentry.setContext("path", path);
        Sentry.captureException(e);
        reject(e);
      }
    });
  }

  uploadFile(path, arr, properties) {
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
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        Sentry.setContext("arg", arg);
        Sentry.setContext("path", path);
        Sentry.captureException(e);
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
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        const res = await response.json();
        resolve(res);
      } catch (e) {
        Sentry.captureException(e);
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
        Sentry.setContext("path", path);
        Sentry.setContext("body", body);
        Sentry.captureException(e);
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
