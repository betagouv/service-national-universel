export function addDsfrStylesheets() {
  if (document.head.querySelector(`link[data-id="dsfr"]`)) {
    return;
  }

  for (const sheet of ["/dsfr/utility/icons/icons.min.css", "/dsfr/dsfr.min.css"]) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = sheet;
    link.setAttribute("data-id", "dsfr");

    document.head.appendChild(link);
  }
}

export function removeDsfrStylesheets() {
  const links = document.head.querySelectorAll(`link[data-id="dsfr"]`);
  links.forEach((link) => link.remove());
}
