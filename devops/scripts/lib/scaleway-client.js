const METHOD = {
  GET: "GET",
  PATCH: "PATCH",
  CREATE: "CREATE",
  DELETE: "delete",
};

const DOMAIN = "https://api.scaleway.com";
const REGION = "fr-par";

const RESOURCE = {
  CONTAINER: "CONTAINER",
};

class ScalewayClient {
  domain = "https://api.scaleway.com";
  region = "fr-par";

  constructor(secretKey, organizationId) {
    this.secretKey = secretKey;
    this.organizationId = organizationId;
  }

  _resource(type) {
    switch (type) {
      case RESOURCE.CONTAINER:
        return {
          listName: "containers",
          endpoint: `${this.domain}/containers/v1beta1/regions/${this.region}/containers`,
        };
      default:
        throw new Error(`Invalid resource type: ${type}`);
    }
  }

  async get(type, id) {
    const resource = this._resource(type);
    return this._getOne(METHOD.GET, `${resource.endpoint}/${id}`);
  }

  async delete(type, id) {
    const resource = this._resource(type);
    return this._getOne(METHOD.DELETE, `${resource.endpoint}/${id}`);
  }

  async create(type, body) {
    const resource = this._resource(type);
    return this._updateOne(METHOD.CREATE, resource.endpoint, body);
  }

  async patch(type, id, body) {
    const resource = this._resource(type);
    return this._updateOne(METHOD.PATCH, `${resource.endpoint}/${id}`, body);
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

  async deleteSecret(secretId) {
    return this._getOne(
      METHOD.DELETE,
      `${this.domain}/containers/v1beta1/regions/${this.region}/secrets/${secretId}`
    );
  }

  async findSecretVersion(projectId, name, revision) {
    return this._getOne(
      METHOD.GET,
      `${this.domain}/secret-manager/v1beta1/regions/${this.region}/secrets-by-path/versions/${revision}/access?project_id=${projectId}&secret_name=${name}`
    );
  }

  async deleteImageTag(tagId) {
    return this._getOne(
      METHOD.DELETE,
      `${this.domain}/registry/v1/regions/${this.region}/tags/${tagId}`
    );
  }

  async deleteContainer(containerId) {
    return this._getOne(
      METHOD.DELETE,
      `${this.domain}/containers/v1beta1/regions/${this.region}/containers/${containerId}`
    );
  }

  async findRegistry(name) {
    return this._findOne(
      `${this.domain}/registry/v1/regions/${this.region}/namespaces?name=${name}`,
      "namespaces"
    );
  }

  async findContainerNamespace(name) {
    return this._findOne(
      `${this.domain}/containers/v1beta1/regions/${this.region}/namespaces?organization_id=${this.organizationId}&name=${name}`,
      "namespaces"
    );
  }

  async createContainerNamespace(name) {
    return this._updateOne(
      METHOD.CREATE,
      `${this.domain}/containers/v1beta1/regions/${this.region}/namespaces`,
      body
    );
  }

  async findContainer(namespaceId, name) {
    return this._findOne(
      `${this.domain}/containers/v1beta1/regions/${this.region}/containers?namespace_id=${namespaceId}&name=${name}`,
      "containers"
    );
  }

  async getContainer(containerId) {
    return this._getOne(
      METHOD.GET,
      `${this.domain}/containers/v1beta1/regions/${this.region}/containers/${containerId}`
    );
  }

  async updateContainer(containerId, body) {
    return this._updateOne(
      METHOD.PATCH,
      `${this.domain}/containers/v1beta1/regions/${this.region}/containers/${containerId}`,
      body
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
