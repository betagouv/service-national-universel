import fetchRetry from "fetch-retry";

import { capture } from "../sentry";
import { apiURL } from "../config";
import { createFormDataForFileUpload, ERRORS } from "snu-lib";

let fetch = window.fetch;

class api {
  constructor() {
    this.token = "";
    this.headers = { "x-user-timezone": new Date().getTimezoneOffset() };
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

  checkToken(shouldRefresh) {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        const response = await fetch(`${apiURL}/referent/${shouldRefresh ? "refresh_token" : "signin_token"}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}`, ...this.headers },
          signal,
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        if (e.name === "AbortError") {
          console.log("Fetch request was manually reloaded, ignoring error.");
          resolve({ ok: false, code: ERRORS.ABORT_ERROR });
        } else {
          capture(e, { extra: { path: "CHECK TOKEN", token: this.token } });
          reject(e);
        }
      }
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
    let response;
    try {
      const controller = new AbortController();
      const { signal } = controller;

      window.addEventListener("beforeunload", () => controller.abort());

      response = await fetch(`${apiURL}${path}`, {
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}`, ...this.headers },
        body: typeof body === "string" ? body : JSON.stringify(body),
        signal,
      });
      if (response.status === 401) {
        if (window?.location?.pathname !== "/auth") {
          window.location.href = "/auth?disconnected=1";
          return;
        }
      }
    } catch (e) {
      if (e.name === "AbortError") {
        console.log("Fetch request was manually reloaded, ignoring error.");
        return;
      } else {
        capture(e, { extra: { path: path, body: body } });
      }
    }
    if (response?.status !== 200) {
      throw await response.json();
    }
    try {
      return response?.blob();
    } catch (e) {
      capture(e, { extra: { path: path, body: body } });
    }
  }

  get(path) {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}`, ...this.headers },
          signal,
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
        if (e.name === "AbortError") {
          console.log("Fetch request was manually reloaded, ignoring error.");
          resolve({ ok: false, code: ERRORS.ABORT_ERROR });
        } else {
          capture(e, { extra: { path: path } });
          reject(e);
        }
      }
    });
  }

  put(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}`, ...this.headers },
          body: typeof body === "string" ? body : JSON.stringify(body),
          signal,
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
        if (e.name === "AbortError") {
          console.log("Fetch request was manually reloaded, ignoring error.");
          resolve({ ok: false, code: ERRORS.ABORT_ERROR });
        } else {
          capture(e, { extra: { path: path, body: body } });
          reject(e);
        }
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
          headers: { Authorization: `JWT ${this.token}`, ...this.headers },
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
        capture(e, { extra: { path: path, body: body } });
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
          headers: { ...this.headers },
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
        capture(e, { extra: { path: path, body: body } });
        reject(e);
      }
    });
  }

  remove(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          credentials: "include",
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}`, ...this.headers },
          body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
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

  uploadFiles(path, arr, properties) {
    const formData = createFormDataForFileUpload(arr, properties);
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { Authorization: `JWT ${this.token}`, ...this.headers },
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
        capture(e, { extra: { arr: arr, path: path, properties: properties } });
        reject(e);
      }
    });
  }

  post(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}`, ...this.headers },
          body: typeof body === "string" ? body : JSON.stringify(body),
          signal,
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
        if (e.name === "AbortError") {
          console.log("Fetch request was manually reloaded, ignoring error.");
          resolve({ ok: false, code: ERRORS.ABORT_ERROR });
        } else {
          capture(e, { extra: { path: path, body: body } });
          reject(e);
        }
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
