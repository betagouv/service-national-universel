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

/**
 * Creates Formdata for file upload and sanitize file names to get past firewall strict validation rules e.g apostrophe
 * @param [File]
 * @returns FormData
 **/
function createFormDataForFileUpload(arr, properties) {
  let files = [];
  if (Array.isArray(arr)) files = arr.filter((e) => typeof e === "object");
  else files = [arr];
  let formData = new FormData();

  // File object name property is read-only, so we need to change it with Object.defineProperty
  for (let file of files) {
    // eslint-disable-next-line no-control-regex
    const name = encodeURIComponent(file.name.replace(/['/:*?"<>|\x00-\x1F\x80-\x9F]/g, "_").trim());
    Object.defineProperty(file, "name", { value: name });
    // We add each file under a different key in order to not squash them
    formData.append(file.name, file, name);
  }

  const names = files.map((e) => e.name || e);
  let allData = { names, ...properties || {} };
  formData.append("body", JSON.stringify(allData));
  return formData;
}

export { download, createFormDataForFileUpload };
