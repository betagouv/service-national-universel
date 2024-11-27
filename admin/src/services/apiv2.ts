import { apiv2URL } from "@/config";
import { capture } from "@/sentry";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toastr } from "react-redux-toastr";

export interface HttpResponse<T = void> extends AxiosResponse {
  data: T;
}

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

  async get<T>(path: string): Promise<HttpResponse<T>> {
    return this.axios.get(path);
  }

  async post<T>(path: string, payload: any): Promise<HttpResponse<T>> {
    return this.axios.post(path, payload);
  }

  async remove<T>(path: string, payload: any): Promise<HttpResponse<T>> {
    return this.axios.delete(path, payload);
  }

  async put<T>(path: string, payload: any): Promise<HttpResponse<T>> {
    return this.axios.put(path, payload);
  }

  async patch<T>(path: string, payload: any): Promise<HttpResponse<T>> {
    return this.axios.patch(path, payload);
  }

  initInterceptor() {
    this.axios.interceptors.request.use((request: InternalAxiosRequestConfig) => {
      request.headers.set({ "x-user-timezone": new Date().getTimezoneOffset(), Authorization: `JWT ${this.token}` });
      request.headers.setContentType("application/json");
      return request;
    });

    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => {
        console.log(error);
        if (error.response?.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return Promise.reject();
          }
        } else if (error.response?.status === 422) {
          capture(error);
          return Promise.reject(error.response.data);
        }
        capture(error);
        toastr.error("Oups, une erreur est survenue", `Code d'erreur: ${error.response.data.correlationId}`);
        return Promise.reject();
      },
    );
  }
}

export const apiv2 = new Apiv2();
