import { apiURL } from "../config";
import { createFormDataForFileUpload, ERRORS } from "snu-lib";
import { capture } from "../sentry";

class api {
  headers: HeadersInit;

  constructor() {
    this.headers = { "x-user-timezone": new Date().getTimezoneOffset().toString() };
  }

  async checkToken() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}/young/signin_token`, {
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        capture(e, { extra: { path: "CHECK TOKEN" } });
        reject(e);
      }
    });
  }

  openpdf(path: string, body: unknown) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
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
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
        });
        if (response.status === 401) {
          if (window?.location?.pathname !== "/auth" && path !== "/cohort") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }

        const clonedResponse = response.clone();
        try {
          const res = await response.json();
          resolve(res);
        } catch (e) {
          capture(e, { extra: { path: path, responseText: await clonedResponse.text() } });
          resolve({ ok: false, code: ERRORS.SERVER_ERROR });
        }
      } catch (e) {
        capture(e, { extra: { path: path } });
        reject(e);
      }
    });
  }

  put(path: string, body: unknown) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
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

  uploadFiles(path: string, arr: unknown[]) {
    const formData = createFormDataForFileUpload(arr);
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: this.headers,
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

  remove(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          credentials: "include",
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...this.headers },
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

  post(path: string, body: unknown) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
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

  logout() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}/young/logout`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...this.headers },
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        capture(e, { extra: { path: "/young/logout" } });
        reject(e);
      }
    });
  }
}

const API = new api();
export default API;
