const METHOD = {
  GET: "GET",
  PATCH: "PATCH",
  CREATE: "CREATE",
  DELETE: "delete",
};

class Project {
  static listName = "projects";
  static pathParams = [];

  endpoint(params) {
    return `/account/v3/projects`;
  }
}

class RegistryNamespace {
  static listName = "namespaces";
  static pathParams = ["region"];

  endpoint(params) {
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

  constructor(secretKey, organizationId) {
    this.secretKey = secretKey;
    this.organizationId = organizationId;
  }

  pathParams = {
    region: this.region,
  };

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
    return this._updateOne(METHOD.CREATE, `${this.domain}${endpoint}`, body);
  }

  async patch(resource, id, body) {
    const endpoint = resource.endpoint({ region: this.region });
    return this._updateOne(
      METHOD.PATCH,
      `${this.domain}${endpoint}/${id}`,
      body
    );
  }

  _querystring(excludeKeys, params) {
    let s = "";
    for (const key in params) {
      if (!excludeKeys.includes(key)) {
        s += `&${key}=${params[key]}`;
      }
    }
    return s.replace("&", "?");
  }

  async findOne(resource, params) {
    let _params = { region: this.region, ...params };
    const endpoint = resource.endpoint(_params);
    const querystring = this._querystring(resource.pathParams, _params);
    return this._findOne(
      `${this.domain}${endpoint}${querystring}`,
      resource.listName
    );
  }

  async findAll(resource, params) {
    let _params = { region: this.region, ...params };
    const endpoint = resource.endpoint(_params);
    const querystring = this._querystring(resource.pathParams, _params);
    return this._findAll(
      `${this.domain}${endpoint}${querystring}`,
      resource.listName
    );
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

  async _findOne(url, listName) {
    const resp = await fetch(url, {
      headers: { "X-Auth-Token": this.secretKey },
    });
    const json = await resp.json();
    if (resp.ok) {
      if (json.total_count == 1) {
        return json[listName][0];
      }
      throw new Error("Resource not found");
    }
    throw new Error("Resource not found", { cause: json.message });
  }

  async _findAll(url, listName) {
    console.log(url);
    const resp = await fetch(url, {
      headers: { "X-Auth-Token": this.secretKey },
    });
    const json = await resp.json();
    if (resp.ok) {
      return json[listName];
    }
    throw new Error("Resource not found", { cause: json.message });
  }

  async findProject(name) {
    return this.findOne(RESOURCE.Project, {
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

    return decodedData;
  }
}

module.exports = { ScalewayClient, RESOURCE };
