import fetchRetry from "fetch-retry";

import { apiURL } from "../config";
import * as Sentry from "@sentry/react";
const fetch = fetchRetry(window.fetch);

function jsonOrRedirectToSignIn(response) {
  if (response.ok === false && response.status === 401) {
    if (window && window.location && window.location.href) {
      window.location.href = "/auth?disconnected=1";
      // We need to return responses to prevent the promise from rejecting.
      return { responses: [] };
    }
  }
  return response.json();
}

class ApiService {
  constructor() {
    this.token = "";
  }

  esQuery(index, body) {
    const header = { index, type: "_doc" };
    return fetch(`${apiURL}/es/${index}/_msearch`, {
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      mode: "cors",
      method: "POST",
      redirect: "follow",
      referrer: "no-referrer",
      headers: { "Content-Type": "application/x-ndjson", Authorization: `JWT ${this.token}` },
      body: [header, body].map((e) => `${JSON.stringify(e)}\n`).join(""),
    })
      .then((r) => jsonOrRedirectToSignIn(r))
      .catch((e) => {
        Sentry.captureMessage("Error caught in esQuery");
        Sentry.captureException(e);
        console.error(e);
        return { responses: [] };
      });
  }

  getTotal(response) {
    return (response && response.hits && response.hits.total) || 0;
  }

  getHits(response) {
    return (response && response.hits && response.hits.hits) || [];
  }

  getAggregations(response) {
    if (!response || !response.aggregations) return {};
    const keys = Object.keys(response.aggregations);
    if (!keys.length) return {};

    if (response.aggregations[keys[0]].value !== undefined) return response.aggregations[keys[0]].value;

    let obj = {};
    for (let i = 0; i < response.aggregations[keys[0]].buckets.length; i++) {
      obj[response.aggregations[keys[0]].buckets[i].key] = response.aggregations[keys[0]].buckets[i].doc_count;
    }
    return obj;
  }

  setToken(token) {
    this.token = token;
  }
  getToken() {
    return this.token;
  }

  openpdf = async (path, body) => {
    try {
      const response = await fetch(`${apiURL}${path}`, {
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        body: typeof body === "string" ? body : JSON.stringify(body),
      });
      if (response.status === 401) throw new Error("unauthorized");
      if (response.status !== 200) return null;
      const file = await response.blob();
      return file;
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  get = async (path) => {
    try {
      const response = await fetch(`${apiURL}${path}`, {
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
      });

      const res = await response.json();
      return res;
    } catch (e) {
      return e;
    }
  };

  put = async (path, body) => {
    try {
      const response = await fetch(`${apiURL}${path}`, {
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        body: typeof body === "string" ? body : JSON.stringify(body),
      });

      const res = await response.json();
      return res;
    } catch (e) {
      return e;
    }
  };

  uploadFile = async (path, arr) => {
    const names = arr.map((e) => e.name || e);
    const files = arr.filter((e) => typeof e === "object");
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i], files[i].name);
    }
    formData.append("body", JSON.stringify({ names }));
    try {
      const response = await fetch(`${apiURL}${path}`, {
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: { Authorization: `JWT ${this.token}` },
        body: formData,
      });
      const res = await response.json();
      return res;
    } catch (e) {
      return e;
    }
  };

  remove = async (path) => {
    try {
      const response = await fetch(`${apiURL}${path}`, {
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        credentials: "include",
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
      });
      const res = await response.json();
      return res;
    } catch (e) {
      return e;
    }
  };

  post = async (path, body) => {
    try {
      const response = await fetch(`${apiURL}${path}`, {
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        body: typeof body === "string" ? body : JSON.stringify(body),
      });
      const res = await response.json();
      if (response.status !== 200) {
        return res;
      }
      return res;
    } catch (e) {
      return e;
    }
  };
}

const API = new ApiService();
export default API;
