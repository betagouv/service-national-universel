function download(file, fileName) {
  if (window.navigator.msSaveOrOpenBlob) {
    //IE11 & Edge
    window.navigator.msSaveOrOpenBlob(file, fileName);
  } else {
    //Other browsers
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}

module.exports = {
  download,
};
