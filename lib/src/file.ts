type MsSaveOrOpenBlob = (
  blob: any,
  defaultName?: string | undefined
) => boolean;

export interface NavigatorWithMsSaveOrOpenBlob extends Navigator {
  msSaveOrOpenBlob: MsSaveOrOpenBlob;
}

export function download(file, fileName) {
  if ((window.navigator as NavigatorWithMsSaveOrOpenBlob).msSaveOrOpenBlob) {
    //IE11 & Edge
    (window.navigator as NavigatorWithMsSaveOrOpenBlob).msSaveOrOpenBlob(
      file,
      fileName
    );
  } else {
    //Other browsers
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}
