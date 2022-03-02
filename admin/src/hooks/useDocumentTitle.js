import React from "react";

const useDocumentTitle = (title) => {
  React.useEffect(() => {
    document.title = [title, "Service National Universel"].join(" • ");
    return () => {
      document.title = "Service National Universel";
    };
  }, []);
};

export default useDocumentTitle;
