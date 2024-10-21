class ScalewayClient {
  endpoint = "https://api.scaleway.com";
  region = "fr-par";

  constructor(secretKey, organizationId) {
    this.secretKey = secretKey;
    this.organizationId = organizationId;
    this.project = null;
  }

  async _getOne(url) {
    const resp = await fetch(url, {
      headers: { "X-Auth-Token": this.secretKey },
    });
    const json = await resp.json();
    if (resp.ok) {
      return json;
    }
    throw new Error("Resource not found", { cause: json.message });
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

  async _deleteOne(url) {
    const resp = await fetch(url, {
      method: "delete",
      headers: { "X-Auth-Token": this.secretKey },
    });
    const json = await resp.json();
    if (!resp.ok) {
      throw new Error("Resource not deleted", { cause: json.message });
    }
  }

  async setProject(name) {
    this.project = await this.findProject(name);
  }

  async findProject(name) {
    return this._findOne(
      `${this.endpoint}/account/v3/projects?organization_id=${this.organizationId}&name=${name}`,
      "projects"
    );
  }

  async findSecrets(projectId) {
    return this._findAll(
      `${this.endpoint}/secret-manager/v1beta1/regions/${this.region}/secrets?project_id=${projectId}&page_size=100`,
      "secrets"
    );
  }

  async deleteSecret(secretId) {
    return this._deleteOne(
      `${this.endpoint}/containers/v1beta1/regions/${this.region}/secrets/${secretId}`
    );
  }

  async findSecretVersion(name, revision) {
    return this._getOne(
      `${this.endpoint}/secret-manager/v1beta1/regions/${this.region}/secrets-by-path/versions/${revision}/access?project_id=${this.project.id}&secret_name=${name}`
    );
  }

  async deleteImageTag(tagId) {
    return this._deleteOne(
      `${this.endpoint}/registry/v1/regions/${this.region}/tags/${tagId}`
    );
  }

  async deleteContainer(containerId) {
    return this._deleteOne(
      `${this.endpoint}/containers/v1beta1/regions/${this.region}/containers/${containerId}`
    );
  }

  async findRegistry(name) {
    return this._findOne(
      `${this.endpoint}/registry/v1/regions/${this.region}/namespaces?name=${name}`,
      "namespaces"
    );
  }

  async findContainerNamespace(name) {
    return this._findOne(
      `${this.endpoint}/containers/v1beta1/regions/${this.region}/namespaces?name=${name}`,
      "namespaces"
    );
  }

  async findContainers(namespaceId) {
    return this._findAll(
      `${this.endpoint}/containers/v1beta1/regions/${this.region}/containers?namespace_id=${namespaceId}&page_size=100`,
      "containers"
    );
  }

  async findImages(registryId) {
    return this._findAll(
      `${this.endpoint}/registry/v1/regions/${this.region}/images?namespace_id=${registryId}`,
      "images"
    );
  }

  async findImageTags(imageId) {
    return this._findAll(
      `${this.endpoint}/registry/v1/regions/${this.region}/images/${imageId}/tags?order_by=created_at_asc&page_size=100`,
      "tags"
    );
  }

  async findImageTagsByName(imageId, name) {
    return this._findAll(
      `${this.endpoint}/registry/v1/regions/${this.region}/images/${imageId}/tags?name=${name}`,
      "tags"
    );
  }

  async getSecrets(name, revision) {
    const secret = await this.findSecretVersion(name, revision);
    const decodedData = Buffer.from(secret.data, "base64").toString("utf8");

    return JSON.parse(decodedData);
  }
}

module.exports = ScalewayClient;
