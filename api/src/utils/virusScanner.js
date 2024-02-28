// virusScanner.js
const { API_ANTIVIRUS_ENDPOINT, API_ANTIVIRUS_TOKEN } = require("../config");
const { capture } = require("../sentry");
const fetch = require("node-fetch");
const FormData = require('form-data');
const { createReadStream } = require('fs');
const { timeout } = require("../utils");
const { ERRORS } = require("./index");

const TIMEOUT_ANTIVIRUS_SERVICE = 10000;

async function scanFile(tempFilePath, name, userId="anonymous") {

  const scan = async () => {
    const stream = createReadStream(tempFilePath);
    const url = `${API_ANTIVIRUS_ENDPOINT}/scan`;

    const formData = new FormData();
    formData.append('file', stream);

    const headers = formData.getHeaders()
    headers["X-Auth-Token"] = API_ANTIVIRUS_TOKEN

    const response = await fetch(url, { method: 'POST', body: formData, headers });

    if (response.status != 200) {
      throw new Error(ERRORS.FILE_SCAN_DOWN);
    }

    const { infected } = await response.json()

    if (infected) {
      capture(`File ${name} of user(${userId}) is infected`);
    }

    return { infected };
  };
  return await timeout(scan(), TIMEOUT_ANTIVIRUS_SERVICE);
}

module.exports = scanFile;
