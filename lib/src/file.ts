/* eslint-disable no-undef */
export function download(file, fileName) {
  if ((window.navigator as any).msSaveOrOpenBlob) {
    //IE11 & Edge
    (window.navigator as any).msSaveOrOpenBlob(file, fileName);
  } else {
    //Other browsers
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}
