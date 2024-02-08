import React, { useEffect, useState, useId } from "react";

const useDocumentCss = (stylesheets) => {
  const [sheets, setSheets] = useState(stylesheets);
  const id = useId();

  useEffect(() => {
    removeSheets();

    for (const sheet of sheets) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = sheet;
      link.setAttribute("data-id", id);

      document.head.appendChild(link);
    }

    return () => removeSheets();
  }, [sheets]);

  const removeSheets = () => {
    const links = document.head.querySelectorAll(`link[data-id="${id}"]`)
    links.forEach((link) => link.remove());
  };

  return setSheets;
};

export default useDocumentCss;
