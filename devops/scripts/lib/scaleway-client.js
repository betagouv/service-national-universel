const METHOD = {
  GET: "GET",
  PATCH: "PATCH",
  CREATE: "CREATE",
  DELETE: "delete",
};

class Project {
  listName = "projects";
  pathParams = [];

  endpoint(params) {
    return `/account/v3/${this.listName}`;
  }
}

class RegistryNamespace {
  listName = "namespaces";
  pathParams = ["region"];

  endpoint(params) {
    return `/registry/v1/regions/${params.region}/${this.listName}`;
  }
}

class Image {
  listName = "images";
  pathParams = ["region"];

  endpoint(params) {
    return `/registry/v1/regions/${params.region}/${this.listName}`;
  }
}

class Container {
  listName = "containers";
  pathParams = ["region"];

  endpoint(params) {
    return `/containers/v1beta1/regions/${params.region}/${this.listName}`;
  }
}

class ContainerNamespace {
  listName = "namespaces";
  pathParams = ["region"];

  endpoint(params) {
    return `/containers/v1beta1/regions/${params.region}/${this.listName}`;
  }
}

class Secret {
  listName = "secrets";
  pathParams = ["region"];

  endpoint(params) {
    return `/secret-manager/v1beta1/regions/${params.region}/${this.listName}`;
  }
}

class ImageTag {
  endpoint(params) {
    return `/registry/v1/regions/${params.region}/tags`;
  }
}

const RESOURCE = {
  CONTAINER: new Container(),
  CONTAINER_NAMESPACE: new ContainerNamespace(),
  SECRET: new Secret(),
  IMAGE: new Image(),
  IMAGE_TAG: new ImageTag(),
  PROJECT: new Project(),
  REGISTRY_NAMESPACE: new RegistryNamespace(),
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
    return this.findOne(RESOURCE.PROJECT, {
      organization_id: this.organizationId,
      name: name,
    });
  }

  async findSecretVersion(projectId, name, revision) {
    return this._getOne(
      METHOD.GET,
      `${this.domain}/secret-manager/v1beta1/regions/${this.region}/secrets-by-path/versions/${revision}/access?project_id=${projectId}&secret_name=${name}`
    );
  }

  async findImageTags(imageId) {
    return this._findAll(
      `${this.domain}/registry/v1/regions/${this.region}/images/${imageId}/tags?order_by=created_at_asc&page_size=100`,
      "tags"
    );
  }

  async findImageTagsByName(imageId, name) {
    return this._findAll(
      `${this.domain}/registry/v1/regions/${this.region}/images/${imageId}/tags?name=${name}`,
      "tags"
    );
  }

  async getSecrets(projectId, name, revision) {
    const secret = await this.findSecretVersion(projectId, name, revision);
    const decodedData = Buffer.from(secret.data, "base64").toString("utf8");

    return decodedData;
  }
}

module.exports = { ScalewayClient, RESOURCE };
