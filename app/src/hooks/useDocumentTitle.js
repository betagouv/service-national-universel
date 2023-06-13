import React from "react";

const useDocumentTitle = (title) => {
  const [t, setTitle] = React.useState(title);
  React.useEffect(() => {
    document.title = [t, "Service National Universel"].join(" • ");
    return () => {
      document.title = "Service National Universel";
    };
  }, [t]);
  return setTitle;
};

export default useDocumentTitle;
