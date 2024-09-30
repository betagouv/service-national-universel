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

interface Api {
  get: (path: string) => Promise<ApiResponse>;
  post: (path: string, body: unknown) => Promise<ApiResponse>;
  put: (path: string, body: unknown) => Promise<ApiResponse>;
  remove: (path: string) => Promise<ApiResponse>;
  getUser: () => Promise<YoungDto>;
  openpdf: (path: string, body: unknown) => Promise<Blob>;
  uploadFiles: (path: string, arr: unknown[]) => Promise<ApiResponse>;
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

  async get(path: string): Promise<ApiResponse> {
    const response = await fetch(`${apiURL}${path}`, {
      ...this.options,
      headers: new Headers({ "Content-Type": "application/json", ...this.headers }),
    });
    if ([401, 403, 404].includes(response.status)) {
      throw new Error(response.status.toString());
    }
    const res = await response.json();
    return res;
  }
  async post(path: string, body: unknown): Promise<ApiResponse> {
    const response = await fetch(`${apiURL}${path}`, {
      ...this.options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
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
  async remove(path: string): Promise<ApiResponse> {
    const response = await fetch(`${apiURL}${path}`, {
      ...this.options,
      method: "DELETE",
      headers: new Headers({ "Content-Type": "application/json", ...this.headers }),
    });
    if ([401, 403, 404].includes(response.status)) {
      throw new Error(response.status.toString());
    }
    const res = await response.json();
    return res;
  }

  async getUser() {
    const { data: user } = await this.get(`${apiURL}/young/signin_token`);
    return user as YoungDto;
  }

  async openpdf(path: string, body: unknown) {
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

  async uploadFiles(path: string, arr: unknown[]): Promise<ApiResponse> {
    const formData = createFormDataForFileUpload(arr);
    const res = await this.post(path, formData);
    return res;
  }
}

const API = new api();
export default API;
