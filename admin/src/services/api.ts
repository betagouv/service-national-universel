import fetchRetry from "fetch-retry";

import { capture } from "../sentry";
import { apiURL } from "../config";
import { createFormDataForFileUpload, ERRORS, RouteResponseBody } from "snu-lib";

// La session repose sur le seul cookie httpOnly `jwt_ref`, envoyé par `credentials: "include"` :
// le JWT n'est plus lisible par le JavaScript de l'admin, où toute XSS le récupérait (FM16, audit
// des fronts du 23/09/2026). On efface le jeton qu'une version précédente a pu laisser en localStorage.
try {
  localStorage.removeItem("jwt_token");
} catch (e) {
  // stockage indisponible (navigation privée stricte) : rien à purger
}

let fetch = window.fetch;

class api {
  headers = {};

  constructor() {
    this.headers = { "x-user-timezone": new Date().getTimezoneOffset() };
  }

  goToAuth() {
    if (window?.location?.pathname !== "/auth") return (window.location.href = "/auth?unauthorized=1");
    return;
  }

  checkToken(shouldRefresh = false): Promise<RouteResponseBody<any> & { user?: any }> {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        const response = await fetch(`${apiURL}/referent/${shouldRefresh ? "refresh_token" : "signin_token"}`, {
          // @ts-ignore
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
          signal,
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        if (e.name === "AbortError") {
          console.log("Fetch request was manually reloaded, ignoring error.");
          resolve({ ok: false, code: ERRORS.ABORT_ERROR });
        } else {
          capture(e, { extra: { path: "CHECK TOKEN" } });
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

    const obj: any = {};
    for (let i = 0; i < response.aggregations[keys[0]].buckets.length; i++) {
      obj[response.aggregations[keys[0]].buckets[i].key] = response.aggregations[keys[0]].buckets[i].doc_count;
    }
    return obj;
  }

  async openpdf(path: string, body: any) {
    let response;
    try {
      const controller = new AbortController();
      const { signal } = controller;

      window.addEventListener("beforeunload", () => controller.abort());

      response = await fetch(`${apiURL}${path}`, {
        // @ts-ignore
        // @ts-ignore
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...this.headers },
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
        capture(e, { extra: { path: path } });
      }
    }
    if (response?.status !== 200) {
      throw await response.json();
    }
    try {
      return response?.blob();
    } catch (e) {
      capture(e, { extra: { path: path } });
    }
  }

  get(path: string, params = {}): Promise<RouteResponseBody<any> & { token?: string; status?: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        // Convert params object to query string
        const queryString = new URLSearchParams(params).toString();
        const url = `${apiURL}${path}${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
          // @ts-ignore
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
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

  put(path: string, body?: any): Promise<RouteResponseBody<any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        const response = await fetch(`${apiURL}${path}`, {
          // @ts-ignore
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
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
          capture(e, { extra: { path: path } });
          reject(e);
        }
      }
    });
  }

  putFormData(path: string, body: any, files: any[]): Promise<RouteResponseBody<any>> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i], files[i].name);
    }
    formData.append("body", JSON.stringify(body));

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          // @ts-ignore
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "PUT",
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
        capture(e, { extra: { path: path } });
        reject(e);
      }
    });
  }

  postFormData(path: string, body: any, files: any[]): Promise<RouteResponseBody<any>> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i], files[i].name);
    }
    formData.append("body", JSON.stringify(body));

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          // @ts-ignore
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
        capture(e, { extra: { path: path } });
        reject(e);
      }
    });
  }

  remove(path: string, body?: any): Promise<RouteResponseBody<any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          // @ts-ignore
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          credentials: "include",
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...this.headers },
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

  uploadFiles(path: string, arr: any[], properties = {}, retries = 3): Promise<RouteResponseBody<any> & { mimeType: string; fileName: string; errors: any[] }> {
    const formData = createFormDataForFileUpload(arr, properties);
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          // @ts-ignore
          retries,
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
        capture(e, { extra: { path: path } });
        reject(e);
      }
    });
  }

  post(path: string, body?: any): Promise<RouteResponseBody<any> & { token?: string; hits?: any; aggregations?: any; responses?: any; young?: any; took?: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController();
        const { signal } = controller;

        window.addEventListener("beforeunload", () => controller.abort());

        const response = await fetch(`${apiURL}${path}`, {
          // @ts-ignore
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
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
          capture(e, { extra: { path: path } });
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
