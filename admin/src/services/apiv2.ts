import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toastr } from "react-redux-toastr";

import { FunctionalException, hashToFormData, HttpError, translate } from "snu-lib";

import { apiv2URL } from "@/config";
import { capture } from "@/sentry";
import { getJwtToken } from "./api";

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

  async get<T>(path: string): Promise<T> {
    return this.axios.get<T, T>(path);
  }

  async post<T>(path: string, payload: unknown): Promise<T> {
    return this.axios.post<T, T>(path, payload);
  }

  async postFile<T>(path: string, file: File, payload?: Record<string, unknown>): Promise<T> {
    const formData = payload ? hashToFormData(payload, "data") : new FormData();
    formData.append("file", file, file.name);

    return this.axios.post<T, T>(path, formData, { headers: { "Content-Type": "multipart/form-data" } });
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
      request.headers.set({ "x-user-timezone": new Date().getTimezoneOffset(), Authorization: `JWT ${getJwtToken()}` });
      if (request.headers["Content-Type"] !== "multipart/form-data") {
        request.headers.setContentType("application/json");
      }
      return request;
    });

    this.axios.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.data.type === "Buffer") {
          return response;
        }
        return response.data;
      },
      (error: AxiosError<HttpError>) => {
        if (error.response?.status === 401) {
          if (window?.location?.pathname !== "/auth") {
            window.location.href = "/auth?disconnected=1";
            return Promise.reject();
          }
        } else if (error.response?.status === 422) {
          capture(error);
          const exception = new FunctionalException(error.response.data);
          return Promise.reject(exception);
        }
        capture(error);
        if (error.code === "ERR_NETWORK") {
          toastr.error("Oups, une erreur est survenue", translate(error.code), { timeOut: 5000 });
        } else {
          toastr.error("Oups, une erreur est survenue", `Code d'erreur: ${error.response?.data.correlationId || error.code}`, { timeOut: 5000 });
        }
        return Promise.reject();
      },
    );
  }
}

export const apiv2 = new Apiv2();
