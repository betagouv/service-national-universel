import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SortableJS from "sortablejs";
import API from "../../services/api";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";

const useIsActive = ({ slug }, onIsActive) => {
  const router = useRouter();

  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(slug === router.query?.slug);
  }, [router.query?.slug]);

  useEffect(() => {
    if (onIsActive) {
      if (active) {
        onIsActive(true);
      } else {
        onIsActive(false);
      }
    }
  }, [active]);
  return active;
};

const horizontalSpacing = 2;

const Branch = ({ section, level, onIsActive, position, parentId, onListChange }) => {
  const [open, setIsOpen] = useState(section.type === "root");

  const isActive = useIsActive(section, onIsActive);
  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const onChildIsActive = (childIsActive) => {
    // open if child is active, don't close if child is not active
    if (childIsActive) setIsOpen(true);
    if (onIsActive) onIsActive(childIsActive);
  };

  const gridRef = useRef(null);
  const sortable = useRef(null);
  useEffect(() => {
    sortable.current = SortableJS.create(gridRef.current, { animation: 150, group: "shared", onEnd: onListChange });
  }, []);

  let isDraft = JSON.stringify(section.children || []).includes("DRAFT") ? " 🚦 " : "";

  return (
    <div data-position={position} data-parentid={parentId || "root"} data-id={section._id || "root"} data-type="section" className={`ml-${level * horizontalSpacing} mb-1 `}>
      <span className={` text-warmGray-500 max-w-full inline-block overflow-hidden overflow-ellipsis whitespace-nowrap ${isActive ? "font-bold" : ""}`}>
        <small className="text-trueGray-400 mr-1 mb-1 w-3 inline-block cursor-pointer" onClick={() => setIsOpen(!open)}>
          {open ? "\u25BC" : "\u25B6"}
        </small>
        <Link href={`/admin/knowledge-base/${section.slug || ""}`} passHref>
          {section.title ? (
            `${open ? "📂" : "📁"}${isDraft}${section.title} (${section.children?.length || 0})`
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline -mt-2 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          )}
        </Link>
      </span>
      <div ref={gridRef} id={`child-container-${section._id || "root"}`} className={`flex flex-col ${!open ? "hidden" : ""}`}>
        {section.children?.map((child) =>
          child.type === "section" ? (
            <Branch
              parentId={child.parentId}
              position={child.position}
              key={child._id}
              section={child}
              level={level + 1}
              onIsActive={onChildIsActive}
              onListChange={onListChange}
            />
          ) : (
            <Answer parentId={child.parentId} position={child.position} key={child._id} article={child} level={level + 1} onIsActive={onChildIsActive} />
          )
        )}
      </div>
    </div>
  );
};

const Answer = ({ article, level, onIsActive, position, parentId }) => {
  const isActive = useIsActive(article, onIsActive);
  return (
    <Link key={article._id} href={`/admin/knowledge-base/${article.slug}`} passHref>
      <a
        data-position={position}
        data-parentid={parentId}
        data-id={article._id}
        href="#"
        className={`text-warmGray-500 overflow-hidden overflow-ellipsis whitespace-nowrap block ml-${level * horizontalSpacing} ${isActive ? "font-bold" : ""}`}
      >
        {`${article.status === "DRAFT" ? "📝" : "📃"}  ${article.title}`}
      </a>
    </Link>
  );
};

const findChildrenRecursive = async (section, allItems) => {
  const childrenContainer = section.querySelector(`#child-container-${section.dataset.id}`);
  for (const [index, child] of Object.entries([...childrenContainer.children])) {
    const updatedChild = {
      position: Number(index) + 1,
      parentId: section.dataset.id === "root" ? null : section.dataset.id,
      _id: child.dataset.id,
    };
    allItems.push(updatedChild);
    if (child.dataset.type === "section") findChildrenRecursive(child, allItems);
  }
};

const getReorderedTree = (root) => {
  const allItems = [];
  findChildrenRecursive(root, allItems);
  return allItems;
};

const KnowledgeBaseTree = ({ visible, setVisible }) => {
  const { tree, mutate } = useKnowledgeBaseData();

  // reloadTreeKey to prevent error `Failed to execute 'removeChild' on 'Node'` from sortablejs after updating messy tree
  const [reloadTreeKey, setReloadeTreeKey] = useState(0);
  const rootRef = useRef(null);
  const onListChange = async () => {
    const response = await API.put({ path: "/support-center/knowledge-base/reorder", body: getReorderedTree(rootRef.current.children[0]) });
    if (!response.ok) return toast.error("Désolé, une erreur est survenue. Veuillez recommencer !");
    mutate();
    setReloadeTreeKey((k) => k + 1);
  };

  return (
    <aside className={`flex flex-col flex-grow-0 flex-shrink-0 border-r-2 shadow-md resize-x p-2 overflow-hidden ${visible ? "w-80" : "w-0 hidden"}`}>
      {/* TODO find a way for tailwind to not filter margins from compiling,
       because things like `ml-${level}` are not compiled */}
      <div className="hidden ml-2 ml-3 ml-4 ml-5 ml-6 ml-7 ml-8 ml-9 ml-10 ml-11 ml-12 ml-13 ml-14 ml-15 ml-16"></div>
      <svg onClick={() => setVisible(false)} xmlns="http://www.w3.org/2000/svg" className="m-2 h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <div ref={rootRef} key={reloadTreeKey} className="overflow-auto">
        <Branch section={tree} level={0} onListChange={onListChange} />
      </div>
    </aside>
  );
};

export default KnowledgeBaseTree;
