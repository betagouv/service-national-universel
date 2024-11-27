import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toastr } from "react-redux-toastr";

import { HttpError } from "snu-lib";

import { apiv2URL } from "@/config";
import { capture } from "@/sentry";
export interface IApiV2 {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, payload: unknown): Promise<T>;
  remove<T>(path: string): Promise<T>;
  put<T>(path: string, payload: unknown): Promise<T>;
  patch<T>(path: string, payload: unknown): Promise<T>;
}
class Apiv2 implements IApiV2 {
  private token: string;
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: apiv2URL,
    });
    this.initInterceptor();
  }

  setToken(token: string) {
    this.token = token;
  }

  async get<T>(path: string): Promise<T> {
    return this.axios.get<T, T>(path);
  }

  async post<T>(path: string, payload: unknown): Promise<T> {
    return this.axios.post<T, T>(path, payload);
  }

  async remove<T>(path: string): Promise<T> {
    return this.axios.delete<T, T>(path);
  }

  async put<T>(path: string, payload: unknown): Promise<T> {
    return this.axios.put<T, T>(path, payload);
  }

  async patch<T>(path: string, payload: unknown): Promise<T> {
    return this.axios.patch<T, T>(path, payload);
  }

  initInterceptor() {
    this.axios.interceptors.request.use((request: InternalAxiosRequestConfig) => {
      request.headers.set({ "x-user-timezone": new Date().getTimezoneOffset(), Authorization: `JWT ${this.token}` });
      request.headers.setContentType("application/json");
      return request;
    });

    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: AxiosError<HttpError>) => {
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
        toastr.error("Oups, une erreur est survenue", `Code d'erreur: ${error.response?.data.correlationId}`);
        return Promise.reject();
      },
    );
  }
}

export const apiv2 = new Apiv2();
