import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useUser from "../hooks/useUser";
import API from "../services/api";
import KnowledgeBaseArticleCard from "./knowledge-base/KnowledgeBaseArticleCard";
import KnowledgeBasePublicNoAnswer from "./knowledge-base/KnowledgeBasePublicNoAnswer";
import Loader from "./Loader";

const Search = ({ restriction, path, showAllowedRoles, showNoAnswerButton, noAnswer }) => {
  const { user } = useUser();

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
      const response = await API.getasync({ path: `/support-center/knowledge-base/${restriction || user.restriction}/search`, query: { search } });
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

  const router = useRouter();
  useEffect(() => {
    setHideItems(true);
  }, [router?.query?.slug]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="relative flex items-center w-full">
        <input
          className="pl-10 py-2.5 w-full pr-3 text-gray-500 transition-colors focus:outline-none text-sm border rounded-md border-gray-300 focus:border-gray-400"
          type="text"
          placeholder="Comment pouvons-nous vous aider ?"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <span className="material-icons absolute text-xl text-gray-400 left-3">search</span>
      </div>
      <div className="relative flex items-center w-full">
        {!hideItems && (search.length > 0 || isSearching || items.length) > 0 && (
          <div className="absolute w-full top-0 left-0 bg-white max-h-80 overflow-auto z-20">
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

export default Search;
