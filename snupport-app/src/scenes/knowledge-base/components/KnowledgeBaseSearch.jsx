import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import Loader from "../../../components/Loader";

const KnowledgeBaseSearch = () => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [items, setItems] = useState([]);
  const [hideItems, setHideItems] = useState(false);

  const searchTimeout = useRef(null);

  const computeSearch = () => {
    if (search.length > 0 && !isSearching) setIsSearching(true);
    if (!search.length) {
      setIsSearching(false);
      setSearch("");
      clearTimeout(searchTimeout.current);
      setItems([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      setHideItems(false);
      const response = await API.get({ path: "/knowledge-base/admin/search", query: { search } });
      setIsSearching(false);
      if (response.ok) {
        setItems(response.data);
      }
    }, 250);
  };

  useEffect(() => {
    computeSearch();
    return () => {
      clearTimeout(searchTimeout.current);
      setIsSearching(false);
    };
  }, [search]);

  const params = useParams();
  useEffect(() => {
    setHideItems(true);
  }, [params?.slug]);

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative flex w-full items-center">
        <input
          className="w-full py-2.5 pl-10 pr-3 text-sm text-gray-500 transition-colors rounded-md border border-gray-300 transition-colors focus:border-gray-400"
          type="text"
          placeholder="Recherche"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <span className="material-icons absolute right-2 text-xl text-red-400 cursor-pointer " onClick={() => setSearch("")}>
          clear
        </span>
        <span className="material-icons absolute left-3 text-xl text-gray-400">search</span>
      </div>
      <div className="relative flex w-full items-center">
        {!hideItems && (search.length > 0 || isSearching || items.length) > 0 && (
          <div className="absolute top-0 left-0 z-50 max-h-80 w-full overflow-auto border bg-white drop-shadow-lg">
            {search.length > 0 && isSearching && !items.length && <Loader size={20} className="my-4" />}
            {search.length > 0 && !isSearching && !items.length && <span className="block py-2 px-8 text-sm text-black">Il n'y a pas de résultat 👀</span>}
            {items?.map((item) => (
              <KnowledgeBaseArticleCard
                key={item._id}
                _id={item._id}
                position={item.position}
                title={item.type === "article" ? item.title : `📂 ${item.title}`}
                slug={item.slug}
                allowedRoles={item.allowedRoles}
                className="!my-0"
                contentClassName="!py-2 !shadow-none !rounded-none border-b-2"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseSearch;
