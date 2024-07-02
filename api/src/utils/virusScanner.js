// virusScanner.js
const config = require("config");
const { capture, captureMessage } = require("../sentry");
const fetch = require("node-fetch");
const FormData = require("form-data");
const { createReadStream } = require("fs");
const { timeout } = require("../utils");
const { ERRORS } = require("./index");

const TIMEOUT_ANTIVIRUS_SERVICE = 20000;

async function getAccessToken(endpoint, apiKey) {
  const response = await fetch(`${endpoint}/auth/token`, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "*",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  const data = await response.json();
  if (data.ok == true && data.token) {
    return data.token;
  } else {
    throw new Error("Couldn't retrieve auth token");
  }
}

async function scanFile(tempFilePath, name, userId = "anonymous") {
  if (!config.get("ENABLE_ANTIVIRUS")) {
    return { infected: false };
  }

  const scan = async () => {
    const stream = createReadStream(tempFilePath);
    const url = `${config.API_ANTIVIRUS_ENDPOINT}/scan`;
    const token = await getAccessToken(config.API_ANTIVIRUS_ENDPOINT, config.API_ANTIVIRUS_KEY);
    const formData = new FormData();
    formData.append("file", stream);

    const headers = formData.getHeaders();
    headers["X-Auth-Token"] = config.API_ANTIVIRUS_TOKEN;
    headers["x-access-token"] = token;

    const response = await fetch(url, { method: "POST", body: formData, headers });

    if (response.status != 200) {
      throw new Error(ERRORS.FILE_SCAN_BAD_RESPONSE);
    }

    const { infected } = await response.json();

    if (infected) {
      captureMessage(`File ${name} of user(${userId}) is infected`);
    }

    return { infected };
  };

  try {
    return await timeout(scan(), TIMEOUT_ANTIVIRUS_SERVICE);
  } catch (error) {
    capture(error);
    throw new Error(ERRORS.FILE_SCAN_DOWN);
  }
}

module.exports = scanFile;
