import { apiURL } from "../config";
import { createFormDataForFileUpload, ERRORS, YoungDto } from "snu-lib";
import { capture } from "../sentry";

interface Headers {
  "x-user-timezone": string;
  "Content-Type"?: string;
}

interface Options {
  mode: RequestMode;
  credentials: RequestCredentials;
}

interface ApiResponse {
  ok: boolean;
  data?: unknown;
  code?: string;
}

class api {
  headers: Headers;
  options: Options;

  constructor() {
    this.headers = {
      "x-user-timezone": new Date().getTimezoneOffset().toString(),
    };
    this.options = {
      mode: "cors",
      credentials: "include",
    };
  }

  async getUser(): Promise<YoungDto> {
    const { data: user } = await this.get(`${apiURL}/young/signin_token`);
    return user as YoungDto;
  }

  async openpdf(path: string, body: unknown): Promise<Blob> {
    const response = await fetch(`${apiURL}${path}`, {
      ...this.options,
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json", ...this.headers }),
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
    if ([401, 403, 404].includes(response.status)) {
      throw new Error(response.status.toString());
    }
    const file = await response.blob();
    return file;
  }

  async get(path: string): Promise<ApiResponse> {
    const response = await fetch(`${apiURL}${path}`, {
      ...this.options,
      headers: { "Content-Type": "application/json", ...this.headers },
    });
    if ([401, 403, 404].includes(response.status)) {
      throw new Error(response.status.toString());
    }
    const res = await response.json();
    return res;
  }

  async put(path: string, body: unknown): Promise<ApiResponse> {
    const response = await fetch(`${apiURL}${path}`, {
      ...this.options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...this.headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
    if ([401, 403, 404].includes(response.status)) {
      throw new Error(response.status.toString());
    }
    const res = await response.json();
    return res;
  }

  uploadFiles(path: string, arr: any[]): Promise<ApiResponse> {
    const formData = createFormDataForFileUpload(arr);
    return new Promise(async (resolve, reject) => {
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
    });
  }

  remove(path: string): Promise<ApiResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
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

  post(path: string, body: any): Promise<ApiResponse> {
    return new Promise(async (resolve, reject) => {
      const controller = new AbortController();
      const { signal } = controller;

      window.addEventListener("beforeunload", () => controller.abort());

      try {
        const response = await fetch(`${apiURL}${path}`, {
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
          resolve({ ok: false, code: ERRORS.ABORT_ERROR }); // You may want to resolve with a specific value or handle differently
        } else {
          capture(e, { extra: { path: path, body: body } });
          reject(e);
        }
      }
    });
  }
}

const API = new api();
export default API;
