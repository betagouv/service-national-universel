const METHOD = {
  GET: "GET",
  PATCH: "PATCH",
  CREATE: "CREATE",
  DELETE: "delete",
};

class Container {
  endpoint(params) {
    return `${params.domain}/containers/v1beta1/regions/${params.region}/containers`;
  }
}

class ContainerNamespace {
  endpoint(params) {
    return `${params.domain}/containers/v1beta1/regions/${params.region}/namespaces`;
  }
}

class Secret {
  endpoint(params) {
    return `${params.domain}/secret-manager/v1beta1/regions/${params.region}/secrets`;
  }
}

class ImageTag {
  endpoint(params) {
    return `${params.domain}/registry/v1/regions/${params.region}/tags`;
  }
}

const RESOURCE = {
  CONTAINER: new Container(),
  CONTAINER_NAMESPACE: new ContainerNamespace(),
  SECRET: new Secret(),
  IMAGE_TAG: new ImageTag(),
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
    domain: this.domain,
  };

  async get(resource, id) {
    const endpoint = resource.endpoint(this.pathParams);
    return this._getOne(METHOD.GET, `${endpoint}/${id}`);
  }

  async delete(resource, id) {
    const endpoint = resource.endpoint(this.pathParams);
    return this._getOne(METHOD.DELETE, `${endpoint}/${id}`);
  }

  async create(resource, body) {
    const endpoint = resource.endpoint(this.pathParams);
    return this._updateOne(METHOD.CREATE, endpoint, body);
  }

  async patch(resource, id, body) {
    const endpoint = resource.endpoint(this.pathParams);
    return this._updateOne(METHOD.PATCH, `${endpoint}/${id}`, body);
  }

  async findOne(type, params) {
    const resource = this._resource(type);
    return this._findOne(`${resource.endpoint}/${id}`, resource.listName);
  }

  async findAll(type, params) {
    const resource = this._resource(type);
    return this._findAll(`${resource.endpoint}/${id}`, resource.listName);
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
    return this._findOne(
      `${this.domain}/account/v3/projects?organization_id=${this.organizationId}&name=${name}`,
      "projects"
    );
  }

  async findSecrets(projectId) {
    return this._findAll(
      `${this.domain}/secret-manager/v1beta1/regions/${this.region}/secrets?project_id=${projectId}&page_size=100`,
      "secrets"
    );
  }

  async findSecretVersion(projectId, name, revision) {
    return this._getOne(
      METHOD.GET,
      `${this.domain}/secret-manager/v1beta1/regions/${this.region}/secrets-by-path/versions/${revision}/access?project_id=${projectId}&secret_name=${name}`
    );
  }

  async findRegistry(projectId, name) {
    return this._findOne(
      `${this.domain}/registry/v1/regions/${this.region}/namespaces?project_id=${projectId}&name=${name}`,
      "namespaces"
    );
  }

  async findContainerNamespace(projectId, name) {
    return this._findOne(
      `${this.domain}/containers/v1beta1/regions/${this.region}/namespaces?project_id=${projectId}&name=${name}`,
      "namespaces"
    );
  }

  async findContainer(namespaceId, name) {
    return this._findOne(
      `${this.domain}/containers/v1beta1/regions/${this.region}/containers?namespace_id=${namespaceId}&name=${name}`,
      "containers"
    );
  }

  async findContainers(namespaceId) {
    return this._findAll(
      `${this.domain}/containers/v1beta1/regions/${this.region}/containers?namespace_id=${namespaceId}&page_size=100`,
      "containers"
    );
  }

  async findImages(registryId) {
    return this._findAll(
      `${this.domain}/registry/v1/regions/${this.region}/images?namespace_id=${registryId}`,
      "images"
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
