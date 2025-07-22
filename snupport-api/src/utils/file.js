const { v4: uuid } = require("uuid");

const getExtension = (fileName) => {
  return fileName.substring(fileName.lastIndexOf(".") + 1);
};

const getS3Path = (fileName) => {
  const extension = getExtension(fileName);
  return `message/${uuid()}.${extension}`;
};

module.exports = {
  getS3Path,
};
