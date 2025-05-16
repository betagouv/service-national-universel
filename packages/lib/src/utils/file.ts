export function download(file, fileName) {
  // @ts-expect-error msSaveOrOpenBlob exists
  if (window.navigator.msSaveOrOpenBlob) {
    // IE11 & Edge
    // @ts-expect-error msSaveOrOpenBlob exists
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

export const cleanFileNamePath = (path?: string) => {
  if (!path) return "";
  const cleanPath = path
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") //remove accents
    .replaceAll(" ", "_") // remove spaces
    .replace(/[^/a-zA-Z0-9._-]/g, ""); // remove special characters
  return cleanPath.length > 1024 ? cleanPath.slice(0, 1024) : cleanPath;
};

/**
 * Creates Formdata for file upload and sanitize file names to get past firewall strict validation rules e.g apostrophe
 * @param [File]
 * @returns FormData
 **/
export function createFormDataForFileUpload(arr: any[], properties) {
  let files: any[] = [];
  if (Array.isArray(arr)) files = arr.filter((e) => typeof e === "object");
  else files = [arr];
  const formData = new FormData();

  // File object name property is read-only, so we need to change it with Object.defineProperty
  for (const file of files) {
    // eslint-disable-next-line no-control-regex
    const name = encodeURIComponent(file.name.replace(/['/:*?"<>|\x00-\x1F\x80-\x9F]/g, "_").trim());
    try {
      Object.defineProperty(file, "name", { value: name, configurable: true });
    } catch (e) {
      console.log(e);
    }
    // We add each file under a different key in order to not squash them
    formData.append(file.name, file, name);
  }

  const names = files.map((e) => e.name || e);
  const allData = { names, ...(properties || {}) };
  formData.append("body", JSON.stringify(allData));
  return formData;
}
