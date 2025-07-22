import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../services/api";
import { buildTree } from "../utils/knowledgeBaseTree";

const KnowledgeBaseContext = React.createContext({});
const root = { type: "root", slug: "", _id: null };

export const KnowledgeBaseProvider = ({ children }) => {
  const [flattenedKB, setFlattenedKB] = useState(() => {
    const cache = window.localStorage.getItem("snu-support-kb");
    if (!cache) return [];
    return JSON.parse(cache);
  });

  const refreshKB = async (allowedRoles) => {
    const response = await API.post({ path: "/knowledge-base/all", body: { allowedRoles: allowedRoles || [] } });
    if (response.ok) {
      setFlattenedKB(response.data);
      window.localStorage.setItem("snu-support-kb", JSON.stringify(response.data));
    }
  };

  useEffect(() => {
    refreshKB();
  }, []);

  const knowledgeBaseTree = useMemo(() => buildTree(root, flattenedKB || []), [flattenedKB]);

  return (
    <KnowledgeBaseContext.Provider value={{ knowledgeBaseTree, flattenedKB, refreshKB, setFlattenedKB }}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export default KnowledgeBaseContext;
