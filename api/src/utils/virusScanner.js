// virusScanner.js
const config = require("config");
const { captureMessage } = require("../sentry");
const fetch = require("node-fetch");
const FormData = require("form-data");
const { createReadStream } = require("fs");
const { timeout } = require("../utils");
const { ERRORS } = require("./index");

const TIMEOUT_ANTIVIRUS_SERVICE = 20000;

async function scanFile(tempFilePath, name, userId = "anonymous") {
  if (!config.get("ENABLE_ANTIVIRUS")) {
    return { infected: false };
  }

  const scan = async () => {
    const stream = createReadStream(tempFilePath);
    const url = `${config.API_ANTIVIRUS_ENDPOINT}/scan`;

    const formData = new FormData();
    formData.append("file", stream);

    const headers = formData.getHeaders();
    headers["X-Auth-Token"] = config.API_ANTIVIRUS_TOKEN;

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
