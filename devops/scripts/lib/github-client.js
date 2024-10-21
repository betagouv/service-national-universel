class GithubClient {
  endpoint = "https://api.github.com/repos/betagouv/service-national-universel";

  constructor(token) {
    this.token = `Bearer ${token}`;
  }

  async _getOne(url) {
    const resp = await fetch(url, {
      headers: { Authorization: this.token },
    });
    const json = await resp.json();
    if (resp.ok) {
      return json;
    }
    throw new Error("Resource not found", { cause: json.message });
  }

  async _findOne(url, listName) {
    const resp = await fetch(url, {
      headers: { Authorization: this.token },
    });
    const json = await resp.json();
    if (resp.ok) {
      if (json.length == 1) {
        return json[0];
      }
      throw new Error("Resource not found");
    }
    throw new Error("Resource not found", { cause: json.message });
  }

  async _findAll(url) {
    const resp = await fetch(url, {
      headers: { Authorization: this.token },
    });
    const json = await resp.json();
    if (resp.ok) {
      return json;
    }
    throw new Error("Resource not found", { cause: json.message });
  }

  findRecentlyUpdatedPullRequests(baseBranch, state) {
    return this._findAll(
      `${this.endpoint}/pulls?base=${baseBranch}&state=${state}&sort=updated&direction=desc`
    );
  }
}

module.exports = GithubClient;
