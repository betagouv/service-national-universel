import React, { useEffect, useState } from "react";

const useDocumentCss = (stylesheets) => {
  const [sheets, setSheets] = useState(stylesheets);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    for (const sheet of sheets) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = sheet;

      document.head.appendChild(link);
      setLinks([...links, link]);
    }

    return () => {
      for (const link of links) {
        link?.remove?.();
      }
    };
  }, [sheets]);

  return setSheets;
};

export default useDocumentCss;
