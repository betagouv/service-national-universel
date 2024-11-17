const { querystring, excludeKeys, sleep, parseEnvFile } = require("./utils");

const METHOD = {
  GET: "GET",
  PATCH: "PATCH",
  POST: "POST",
  DELETE: "delete",
};

class Project {
  static listName = "projects";
  static pathParams = [];

  static endpoint(params) {
    return `/account/v3/projects`;
  }
}

class RegistryNamespace {
  static listName = "namespaces";
  static pathParams = ["region"];

  static endpoint(params) {
    return `/registry/v1/regions/${params.region}/namespaces`;
  }
}

class Image {
  static listName = "images";
  static pathParams = ["region"];

  static endpoint(params) {
    return `/registry/v1/regions/${params.region}/images`;
  }

  static Tag = class {
    static listName = "tags";
    static pathParams = ["region", "image_id"];

    static endpoint(params) {
      return `/registry/v1/regions/${params.region}/images/${params.image_id}/tags`;
    }
  };
}

class Container {
  static listName = "containers";
  static pathParams = ["region"];

  static endpoint(params) {
    return `/containers/v1beta1/regions/${params.region}/containers`;
  }
}

class ContainerNamespace {
  static listName = "namespaces";
  static pathParams = ["region"];

  static endpoint(params) {
    return `/containers/v1beta1/regions/${params.region}/namespaces`;
  }
}

class Secret {
  static listName = "secrets";
  static pathParams = ["region"];

  static endpoint(params) {
    return `/secret-manager/v1beta1/regions/${params.region}/secrets`;
  }
}

class ImageTag {
  static endpoint(params) {
    return `/registry/v1/regions/${params.region}/tags`;
  }
}

const RESOURCE = {
  Container,
  ContainerNamespace,
  Secret,
  Image,
  ImageTag,
  Project,
  RegistryNamespace,
};

class ScalewayClient {
  domain = "https://api.scaleway.com";
  region = "fr-par";
  poll_interval_ms = 5000;

  constructor(secretKey, organizationId) {
    this.secretKey = secretKey;
    this.organizationId = organizationId;
  }

  async get(resource, id) {
    const endpoint = resource.endpoint({ region: this.region });
    return this._getOne(METHOD.GET, `${this.domain}${endpoint}/${id}`);
  }

  async delete(resource, id) {
    const endpoint = resource.endpoint({ region: this.region });
    return this._getOne(METHOD.DELETE, `${this.domain}${endpoint}/${id}`);
  }

  async create(resource, body) {
    const endpoint = resource.endpoint({ region: this.region });
    return this._updateOne(METHOD.POST, `${this.domain}${endpoint}`, body);
  }

  async patch(resource, id, body) {
    const endpoint = resource.endpoint({ region: this.region });
    return this._updateOne(
      METHOD.PATCH,
      `${this.domain}${endpoint}/${id}`,
      body
    );
  }

  async action(resource, id, action) {
    const endpoint = resource.endpoint({ region: this.region });
    return this._getOne(
      METHOD.POST,
      `${this.domain}${endpoint}/${id}/${action}`
    );
  }

  async find(resource, params) {
    const endpoint = resource.endpoint({ region: this.region, ...params });
    const query = querystring(excludeKeys(params, resource.pathParams));
    const items = await this._find(
      `${this.domain}${endpoint}${query}`,
      resource.listName
    );
    switch (items.length) {
      case 0:
        return null;
      case 1:
        return items[0];
      default:
        throw new Error("Multiple resources found");
    }
  }

  async findOrThrow(resource, params) {
    const item = await this.find(resource, params);
    if (item === null) {
      throw new Error("Resource not found");
    }
    return item;
  }

  async findAll(resource, params) {
    const endpoint = resource.endpoint({ region: this.region, ...params });
    const query = querystring(excludeKeys(params, resource.pathParams));
    return this._find(`${this.domain}${endpoint}${query}`, resource.listName);
  }

  async _getOne(method, url) {
    const resp = await fetch(url, {
      method,
      headers: { "X-Auth-Token": this.secretKey },
    });
    const json = await resp.json();
    if (resp.ok) {
      return json;
    }
    throw new Error("Resource not found", { cause: json.message });
  }

  async _updateOne(method, url, body) {
    const resp = await fetch(url, {
      method: method,
      headers: {
        "X-Auth-Token": this.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await resp.json();
    if (resp.ok) {
      return json;
    }
    throw new Error(`${method} resource failed`, { cause: json.message });
  }

  async _find(url, listName) {
    const resp = await fetch(url, {
      headers: { "X-Auth-Token": this.secretKey },
    });
    const json = await resp.json();
    if (resp.ok) {
      return json[listName];
    }
    throw new Error("Resource not found", { cause: json.message });
  }

  async waitUntilSuccess(resource, id) {
    let item;
    do {
      await sleep(this.poll_interval_ms);
      item = await this.get(resource, id);
      if (item.status === "error") {
        throw new Error(item.error_message);
      }
    } while (item.status !== "ready");
  }

  async findProject(name) {
    return this.findOrThrow(RESOURCE.Project, {
      organization_id: this.organizationId,
      name: name,
    });
  }

  async getSecrets(projectId, name, revision) {
    const secret = await this._getOne(
      METHOD.GET,
      `${this.domain}/secret-manager/v1beta1/regions/${this.region}/secrets-by-path/versions/${revision}/access?project_id=${projectId}&secret_name=${name}`
    );
    const decodedData = Buffer.from(secret.data, "base64").toString("utf8");

    return parseEnvFile(decodedData);
  }
}

module.exports = { ScalewayClient, RESOURCE };
