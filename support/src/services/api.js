import URI from "urijs";
import { apiURL } from "../config";

class ApiService {
  getUrl = (path, query = {}) => {
    return new URI().origin(apiURL).path(path).setSearch(query).toString();
  };

  swrFetcher = (url) =>
    fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }).then((res) => res.json());

  execute = async ({ method, path = "", body = null, query = {}, headers = {}, credentials = null, debug = false } = {}) => {
    try {
      const options = {
        method,
        credentials: "include",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };

      if (body) options.body = JSON.stringify(body);
      if (credentials) options.credentials = credentials;

      const url = this.getUrl(path, query);
      console.log("url", url);
      const response = await fetch(url, options);

      if (!response.ok && response.status === 401) {
        if (this.logout) this.logout("401");
        return response;
      }

      try {
        const res = await response.json();
        return res;
      } catch (errorFromJson) {
        console.log({ errorFromJson });
      }
    } catch (errorExecuteApi) {
      console.log({ errorExecuteApi });
    }
    return {
      ok: false,
      error: "Une erreur est survenue, l'équipe technique est prévenue, veuillez nous en excuser.",
    };
  };

  post = (args) => this.execute({ method: "POST", ...args });
  get = async (args) => this.execute({ method: "GET", ...args });
  put = (args) => this.execute({ method: "PUT", ...args });
  delete = (args) => this.execute({ method: "DELETE", ...args });

  postWithCreds = (args) => this.execute({ method: "POST", credentials: "include", ...args });
  getWithCreds = async (args) => this.execute({ method: "GET", credentials: "include", ...args });
  putWithCreds = (args) => this.execute({ method: "PUT", credentials: "include", ...args });
  deleteWithCreds = (args) => this.execute({ method: "DELETE", credentials: "include", ...args });
}

const API = new ApiService();
export default API;
