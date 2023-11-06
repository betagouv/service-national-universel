import React, { useEffect, useState } from "react";

const useDocumentCss = (stylesheets) => {
  const [sheets, setSheets] = useState(stylesheets);

  useEffect(() => {
    for (const sheet of sheets) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = sheet;

      document.head.appendChild(link);
    }

    return () => {
      const links = document.head.getElementsByTagName("link");
      for (const link of links) {
        if (sheets.some((s) => link.href.includes(s))) {
          link.remove();
        }
      }
    };
  }, [sheets]);

  return setSheets;
};

export default useDocumentCss;
