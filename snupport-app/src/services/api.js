import URI from "urijs";
import { SNUPPORT_URL_API } from "../config";
import fetchRetry from "fetch-retry";
import "isomorphic-fetch";
import { capture } from "../sentry";

let fetch = window.fetch;

class ApiService {
  constructor() {
    this.token = "";
  }

  setToken(token) {
    this.token = token;
  }

  getUrl = (path, query = {}) => {
    return new URI(SNUPPORT_URL_API).path(path).setSearch(query).toString();
  };

  execute = async ({ method, path = "", body = null, query = {}, headers = {} } = {}) => {
    // TODO: refetch and abort errors are already handled when the request is given to react-query, they should be removed or made optional.
    let handleBeforeUnload = () => {};
    let response = null;
    try {
      const controller = new AbortController();
      const { signal } = controller;
      handleBeforeUnload = () => controller.abort();

      window.addEventListener("beforeunload", handleBeforeUnload);

      const options = {
        method,
        credentials: "include",
        mode: "cors",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `JWT ${this.token}`,
        },
        retries: 3,
        retryDelay: 1000,
        signal,
      };

      if (body) options.body = JSON.stringify(body);

      const url = this.getUrl(path, query);
      // console.log("url", url);
      response = await fetch(url, options);

      if (!response.ok && response.status === 401) {
        this.token = "";
        if (!window.location.pathname.includes("/auth")) {
          window.location.href = "/auth";
        }
      }
      const clonedResponse = response.clone();
      try {
        const res = await response.json();
        return res;
      } catch (e) {
        capture(e, { extra: { path: path, responseText: await clonedResponse.text() } });
        return { ok: false, code: "SERVER_ERROR" };
      }
    } catch (errorExecuteApi) {
      if (errorExecuteApi.name === "AbortError") {
        console.log("Fetch request was manually reloaded, ignoring error.");
      } else {
        capture(errorExecuteApi, { extra: { response, headers, query, method, path, body } });
        console.log({ errorExecuteApi });
      }
    } finally {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    return {
      ok: false,
      error: "Une erreur est survenue, l'équipe technique est prévenue, veuillez nous en excuser.",
    };
  };

  patch = (args) => this.execute({ method: "PATCH", ...args });
  post = (args) => this.execute({ method: "POST", ...args });
  get = (args) => this.execute({ method: "GET", ...args });
  put = (args) => this.execute({ method: "PUT", ...args });
  delete = (args) => this.execute({ method: "DELETE", ...args });

  async uploadFile(path, files, properties) {
    const formData = new FormData();
    const filesArray = Array.isArray(files) ? files : Array.from(files);
    filesArray.forEach((file) => {
      formData.append(file.name, file, file.name);
      formData.append("body", JSON.stringify(properties));
    });

    const controller = new AbortController();
    const handleBeforeUnload = () => controller.abort();
    window.addEventListener("beforeunload", handleBeforeUnload);

    try {
      const response = await fetch(this.getUrl(path), {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: formData,
        signal: controller.signal,
        headers: {
          Authorization: `JWT ${this.token}`,
        },
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
      });

      return await response.json();
    } catch (e) {
      if (e.name === "AbortError") {
        console.log("Fetch request was manually reloaded, ignoring error.");
      } else {
        capture(e, { extra: { path, files, properties } });
      }
    } finally {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    return {
      ok: false,
      error: "Une erreur est survenue, l'équipe technique est prévenue, veuillez nous en excuser.",
    };
  }
}

function initApi() {
  fetch = fetchRetry(window.fetch);
}

const API = new ApiService();
export default API;

export { initApi };
