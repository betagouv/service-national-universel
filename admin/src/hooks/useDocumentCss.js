import React, { useEffect } from "react";

const useDocumentCss = (stylesheets) => {
  const [sheets, setSheets] = React.useState(stylesheets);
  const [links, setLinks] = React.useState([]);

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
        document.head.removeChild(link);
      }
    };
  }, [sheets]);

  return setSheets;
};

export default useDocumentCss;
