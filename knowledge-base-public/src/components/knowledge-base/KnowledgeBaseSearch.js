import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import API from "../../services/api";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCardOld";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import Loader from "../Loader";

const KnowledgeBaseSearch = ({ restriction, path, showAllowedRoles, showNoAnswerButton, noAnswer, placeholder = "Comment pouvons-nous vous aider ?", className = "" }) => {
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
      const response = await API.get({ path: `/knowledge-base/${restriction}/search`, query: { search } });
      setIsSearching(false);
      if (response.ok) {
        setItems(response.data);
      }
    }, 1000);
  };

  useEffect(() => {
    computeSearch();
    return () => {
      clearTimeout(searchTimeout.current);
      setIsSearching(false);
    };
  }, [search]);

  const router = useRouter();
  useEffect(() => {
    setHideItems(true);
  }, [router?.query?.slug]);

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative flex w-full items-center">
        <input
          className={`w-full py-2.5 pl-10 pr-3 text-sm text-gray-500 transition-colors ${className}`}
          type="text"
          placeholder={placeholder}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <span className="material-icons absolute right-2 text-xl text-red-400" onClick={() => setSearch("")}>
          clear
        </span>
        <span className="material-icons absolute left-3 text-xl text-gray-400">search</span>
      </div>
      <div className="relative flex w-full items-center">
        {!hideItems && (search.length > 0 || isSearching || items.length) > 0 && (
          <div className="absolute top-0 left-0 z-20 max-h-80 w-full overflow-auto bg-white">
            {search.length > 0 && isSearching && !items.length && <Loader size={20} className="my-4" />}
            {search.length > 0 && !isSearching && !items.length && <span className="block py-2 px-8 text-sm text-black">{noAnswer}</span>}
            {items?.map((item) => (
              <KnowledgeBaseArticleCard
                key={item._id}
                _id={item._id}
                position={item.position}
                title={item.type === "article" ? item.title : `📂 ${item.title}`}
                slug={item.slug}
                path={path}
                allowedRoles={showAllowedRoles ? item.allowedRoles : []}
                className="!my-0"
                contentClassName="!py-2 !shadow-none !rounded-none border-b-2"
              />
            ))}
            {showNoAnswerButton && <KnowledgeBasePublicNoAnswer className="!my-0 !shadow-none" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseSearch;
