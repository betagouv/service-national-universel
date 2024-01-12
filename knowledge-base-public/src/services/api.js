import URI from "urijs";
import { supportApiUrl } from "../config";

/**
 * Creates Formdata for file upload and sanitize file names to get past firewall strict validation rules e.g apostrophe
 * @param [File]
 * @returns FormData
 **/
function createFormDataForFileUpload(arr, properties) {
  let files = [];
  if (Array.isArray(arr)) files = arr.filter((e) => typeof e === "object");
  else files = [arr];
  let formData = new FormData();

  // File object name property is read-only, so we need to change it with Object.defineProperty
  for (let file of files) {
    // eslint-disable-next-line no-control-regex
    const name = encodeURIComponent(file.name.replace(/['/:*?"<>|\x00-\x1F\x80-\x9F]/g, "_").trim());
    Object.defineProperty(file, "name", { value: name });
    // We add each file under a different key in order to not squash them
    formData.append(file.name, file, name);
  }

  const names = files.map((e) => e.name || e);
  let allData = { names, ...(properties || {}) };
  formData.append("body", JSON.stringify(allData));
  return formData;
}

class ApiService {
  getUrl({ origin = supportApiUrl, path, query = {} }) {
    return new URI().origin(origin).path(path).setSearch(query).toString();
  }

  async swrFetcher(url) {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.json();
  }

  async execute({ origin = supportApiUrl, method, path = "", body = null, query = {}, headers = {}, credentials = null } = {}) {
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

      const url = this.getUrl({ origin, path, query });
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
  }

  post(args) {
    return this.execute({ method: "POST", ...args });
  }
  get(args) {
    return this.execute({ method: "GET", ...args });
  }
  put(args) {
    return this.execute({ method: "PUT", ...args });
  }
  delete(args) {
    return this.execute({ method: "DELETE", ...args });
  }

  uploadFiles(path, files) {
    const formData = createFormDataForFileUpload(files);
    return new Promise((resolve, reject) => {
      try {
        fetch(this.getUrl({ path }), {
          retries: 3,
          retryDelay: 1000,
          retryOn: [502, 503, 504],
          mode: "cors",
          method: "POST",
          credentials: "include",
          body: formData,
        })
          .then((res) => res.json())
          .then(resolve);
      } catch (e) {
        reject(e);
      }
    });
  }
}

const API = new ApiService();
export default API;
