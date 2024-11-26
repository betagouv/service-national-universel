import { apiv2URL } from "@/config";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

class Apiv2 {
  token: string;
  axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: apiv2URL,
    });
    this.initInterceptor();
  }

  setToken(token: string) {
    this.token = token;
  }

  async put(path: string, payload: any) {
    return this.axios.put(path, payload).then((res) => {
      return { ok: res.statusText, code: res.status, data: res.data };
    });
  }

  initInterceptor() {
    this.axios.interceptors.request.use((request: InternalAxiosRequestConfig) => {
      request.headers.set({ "x-user-timezone": new Date().getTimezoneOffset(), Authorization: `JWT ${this.token}` });
      request.headers.setContentType("application/json");
      return request;
    });

    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return;
          }
        }
        return Promise.reject(error.response.data);
      },
    );
  }
}

export const apiv2 = new Apiv2();
