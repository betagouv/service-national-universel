// virusScanner.js
const { API_ANTIVIRUS_ENDPOINT } = require("../config");
const { capture } = require("../sentry");
const fetch = require("node-fetch");
const FormData = require('form-data');
const { createReadStream } = require('fs');
const { timeout } = require("../utils");
const { ERRORS } = require("./index");

const TIMEOUT_ANTIVIRUS_SERVICE = 10000;

async function scanFile(tempFilePath, name, userId) {

  const scan = async () => {
    const stream = createReadStream(tempFilePath);
    const url = `${API_ANTIVIRUS_ENDPOINT}/scan`;

    const formData = new FormData();
    formData.append('file', stream);

    const response = await fetch(url, { method: 'POST', body: formData });

    switch (response.status) {
      case 200:
        return { infected: false };
      case 403:
        capture(`File ${name} of user(${userId}) is infected`);
        return { infected: true };
      default:
        throw new Error(ERRORS.FILE_SCAN_DOWN);
    }
  };
  return await timeout(scan(), TIMEOUT_ANTIVIRUS_SERVICE);
}

module.exports = scanFile;
