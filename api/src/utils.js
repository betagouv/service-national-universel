const AWS = require("aws-sdk");
const https = require("https");
const http = require("http");
const passwordValidator = require("password-validator");

const { CELLAR_ENDPOINT, CELLAR_KEYID, CELLAR_KEYSECRET, BUCKET_NAME } = require("./config");

function getReq(url, cb) {
  if (url.toString().indexOf("https") === 0) return https.get(url, cb);
  return http.get(url, cb);
}

function uploadFile(path, file) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    var params = {
      Bucket: BUCKET_NAME,
      Key: path,
      Body: file.data,
      ContentEncoding: file.encoding,
      ContentType: file.mimetype,
      Metadata: { "Cache-Control": "max-age=31536000" },
    };
    s3bucket.upload(params, function (err, data) {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

const getFile = (name) => {
  const p = new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    const params = { Bucket: BUCKET_NAME, Key: name };
    s3bucket.getObject(params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
  return p;
};

function fileExist(url) {
  return new Promise((resolve, reject) => {
    getReq(url, (resp) => {
      if (resp.statusCode === 200) return resolve(true);
      return resolve(false);
    }).on("error", (err) => {
      resolve(false);
      console.log("Error: " + err.message);
    });
  });
}

function validatePassword(password) {
  const schema = new passwordValidator();
  schema
    .is()
    .min(8) // Minimum length 8
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols(); // Must have symbols

  return schema.validate(password);
}

const ERRORS = {
  SERVER_ERROR: "SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
  PASSWORD_TOKEN_EXPIRED_OR_INVALID: "PASSWORD_TOKEN_EXPIRED_OR_INVALID",
  OPERATION_UNAUTHORIZED: "OPERATION_UNAUTHORIZED",
  USER_ALREADY_REGISTERED: "USER_ALREADY_REGISTERED",
  PASSWORD_NOT_VALIDATED: "PASSWORD_NOT_VALIDATED",
  INVITATION_TOKEN_EXPIRED_OR_INVALID: "INVITATION_TOKEN_EXPIRED_OR_INVALID",
  FILE_CORRUPTED: "FILE_CORRUPTED",
  YOUNG_ALREADY_REGISTERED: "YOUNG_ALREADY_REGISTERED",
  UNSUPPORTED_TYPE: "UNSUPPORTED_TYPE",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  LINKED_OBJECT: "LINKED_OBJECT",
  NO_TEMPLATE_FOUND: "NO_TEMPLATE_FOUND",
};

module.exports = {
  uploadFile,
  getFile,
  fileExist,
  validatePassword,
  ERRORS,
};
