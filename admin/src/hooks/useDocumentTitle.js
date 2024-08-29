import { useEffect } from "react";

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = `${title} • Service National Universel`;
    return () => {
      document.title = "Service National Universel";
    };
  }, [title]);
};

export default useDocumentTitle;
