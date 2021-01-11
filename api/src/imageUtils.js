const gm = require("gm");
const imageMagic = gm.subClass({ imageMagick: true });
const { resolve } = require("path");

const watermarkPath = resolve(__dirname, "./assets/watermark.png");
const watermarkWidth = 300;
const watermarkHeight = 300;

const watermarkPdf = async (data, page) => {
  const { width, height } = await getImageSize(data);
  const watermarkXPos = (width - watermarkWidth) / 2;
  const watermarkYPos = (height - watermarkHeight) / 2;

  console.log("width, height", width, height);
  console.log("watermarkXPos", watermarkXPos);
  console.log("watermarkYPos", watermarkYPos);

  return new Promise((resolve, reject) => {
    gm(data)
      .selectFrame(page)
      .draw([`image over ${watermarkXPos},${watermarkYPos} ${watermarkWidth},${watermarkHeight} "${watermarkPath}"`])
      .toBuffer("PNG", (err, buffer) => {
        if (!err) {
          resolve(buffer);
        } else {
          console.log("err", err);
          reject(buffer);
        }
      });
  });
};

const watermarkImage = async (data) => {
  const { width, height } = await getImageSize(data);
  const watermarkXPos = (width - watermarkWidth) / 2;
  const watermarkYPos = (height - watermarkHeight) / 2;

  return new Promise((resolve, reject) => {
    gm(data)
      .draw([`image over ${watermarkXPos},${watermarkYPos} ${watermarkWidth},${watermarkHeight} "${watermarkPath}"`])
      .toBuffer("PNG", (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
  });
};

const getImageSize = (data) => {
  return new Promise((resolve, reject) => {
    gm(data).size((err, size) => {
      if (err) return reject(err);

      resolve(size);
    });
  });
};

const writeBufferToPng = (data) => {
  const path = resolve(__dirname, "./assets/output_test.png");

  return new Promise((reject, resolve) => {
    imageMagic(Buffer.from(data)).write(path, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};

module.exports = { watermarkPdf, watermarkImage, writeBufferToPng };
