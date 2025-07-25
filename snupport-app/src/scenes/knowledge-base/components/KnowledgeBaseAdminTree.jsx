import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SortableJS from "sortablejs";
import { toast } from "react-toastify";
import API from "../../../services/api";
import Loader from "../../../components/Loader";
import KnowledgeBaseContext from "../contexts/knowledgeBase";

const useIsActive = ({ slug }, onIsActive) => {
  const params = useParams();

  const active = useMemo(() => slug === params?.slug, [slug, params?.slug]);

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

const Branch = ({ section, level, position, initShowOpen, cachedOpenedPositions, parentId, onListChange, onIsActive, onToggleOpen, isSortable, onClick, className = "" }) => {
  const [open, setIsOpen] = useState(initShowOpen);
  useEffect(() => {
    if (isMounted) onToggleOpen(open);
  }, [open]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

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
  const sortableRef = useRef(null);
  useEffect(() => {
    if (isSortable) {
      sortableRef.current = SortableJS.create(gridRef.current, { animation: 150, group: "shared", onEnd: onListChange });
    }
  }, [isSortable]);

  return (
    <div
      data-position={position}
      data-open={open}
      data-parentid={parentId || "root"}
      data-id={section._id || "root"}
      data-type="section"
      className={`flex flex-col ml-${level * horizontalSpacing} ${className}`}
    >
      <span className={` inline-block  max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-warmGray-500 ${isActive ? "font-bold" : ""}`}>
        <small className="mr-1 inline-block w-3 cursor-pointer text-trueGray-400" onClick={() => setIsOpen(!open)}>
          {open ? "\u25BC" : "\u25B6"}
        </small>
        <a onClick={() => onClick(section.slug || "")} className={`inline cursor-pointer text-warmGray-500 ${section.status === "DRAFT" ? "italic opacity-40" : ""}`}>
          {section.title ? (
            `${open ? "📂" : "📁"} ${section.title} (${section.children?.length || 0})`
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="-mt-2 inline h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          )}
        </a>
      </span>
      <div ref={gridRef} id={`child-container-${section._id || "root"}`} className={`flex flex-col ${!open ? "hidden" : ""}`}>
        {section.children?.map((child, index) =>
          child.type === "section" ? (
            <Branch
              parentId={child.parentId}
              position={child.position || index + 1}
              key={child._id}
              section={child}
              level={level + 1}
              onIsActive={onChildIsActive}
              onListChange={onListChange}
              onToggleOpen={onToggleOpen}
              initShowOpen={!!cachedOpenedPositions.find((item) => item._id === child._id && !!item.initShowOpen)}
              cachedOpenedPositions={cachedOpenedPositions}
              isSortable={isSortable}
              onClick={onClick}
            />
          ) : (
            <Answer parentId={child.parentId} position={child.position} key={child._id} article={child} level={level + 1} onIsActive={onChildIsActive} onClick={onClick} />
          )
        )}
      </div>
    </div>
  );
};

const Answer = ({ article, level, onIsActive, position, parentId, onClick }) => {
  const isActive = useIsActive(article, onIsActive);
  return (
    <a
      key={article._id}
      data-position={position}
      data-parentid={parentId}
      data-id={article._id}
      onClick={() => onClick(article.slug)}
      className={`block cursor-pointer  overflow-hidden text-ellipsis whitespace-nowrap text-warmGray-500 ml-${level * horizontalSpacing} ${isActive ? "font-bold" : ""}`}
    >
      {"📃 "} <span className={`${article.status === "DRAFT" ? "italic opacity-40" : ""}`}>{article.title}</span>
    </a>
  );
};

const findChildrenRecursive = async (section, allItems) => {
  const childrenContainer = section.querySelector(`#child-container-${section.dataset.id}`);
  for (const [index, child] of Object.entries([...childrenContainer.children])) {
    const updatedChild = {
      position: Number(index) + 1,
      parentId: section.dataset.id === "root" ? null : section.dataset.id,
      _id: child.dataset.id,
      initShowOpen: child.dataset.open === "false" ? false : true,
    };
    allItems.push(updatedChild);
    if (child.dataset.type === "section") findChildrenRecursive(child, allItems);
  }
};

const getElementsNewState = (root) => {
  const allItems = [];
  findChildrenRecursive(root, allItems);
  return allItems;
};

const KnowledgeBaseAdminTree = ({ isSortable, onClick }) => {
  const { knowledgeBaseTree, flattenedKB, refreshKB, setFlattenedKB } = useContext(KnowledgeBaseContext);

  // reloadTreeKey to prevent error `Failed to execute 'removeChild' on 'Node'` from sortablejs after updating messy tree
  const [reloadTreeKey, setReloadeTreeKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [cachedOpenedPositions, setCachedOpenedPositions] = useState(JSON.parse(localStorage.getItem("snu-support-kb-tree-positions-cached") || "[]"));
  useEffect(() => {
    localStorage.setItem("snu-support-kb-tree-positions-cached", JSON.stringify(cachedOpenedPositions));
  }, [cachedOpenedPositions]);

  const rootRef = useRef(null);

  const onListChange = useCallback(async () => {
    setIsSaving(true);
    const elementsNewState = getElementsNewState(rootRef.current.children[0]);
    setCachedOpenedPositions(elementsNewState);
    const response = await API.put({
      path: "/knowledge-base/reorder",
      body: elementsNewState.filter((newItem) => {
        const originalItem = flattenedKB.find((original) => original._id === newItem._id);
        return originalItem.position !== newItem.position || originalItem.parentId !== newItem.parentId;
      }),
    });
    if (!response.ok) {
      setIsSaving(false);
      return toast.error("Désolé, une erreur est survenue. Veuillez recommencer !");
    }
    setReloadeTreeKey((k) => k + 1);
    setFlattenedKB(response.data);
    refreshKB();
    setReloadeTreeKey((k) => k + 1);
    setIsSaving(false);
  }, [flattenedKB, reloadTreeKey]);

  const onToggleOpen = () => {
    const elementsNewState = getElementsNewState(rootRef.current.children[0]);
    setCachedOpenedPositions(elementsNewState);
  };
  return (
    <>
      {/* TODO find a way for tailwind to not filter margins from compiling,
       because things like `ml-${level}` are not compiled */}
      <div className="dir-ltr dir-ltr ml-13 ml-15 ml-2 ml-3 ml-4 ml-5 ml-6 ml-7 ml-8 ml-9 ml-10 ml-11 ml-12 ml-14 ml-16 hidden"></div>
      <div ref={rootRef} key={reloadTreeKey} className="dir-rtl overflow-auto px-2 pt-2 pb-10">
        <Branch
          section={knowledgeBaseTree}
          level={0}
          key={flattenedKB}
          onListChange={onListChange}
          onToggleOpen={onToggleOpen}
          initShowOpen
          cachedOpenedPositions={cachedOpenedPositions}
          isSortable={isSortable}
          onClick={onClick}
          className="dir-ltr"
        />
      </div>
      {!!isSaving && (
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-gray-500 opacity-25">
          <Loader color="#bbbbbb" size={40} />
        </div>
      )}
    </>
  );
};

export default KnowledgeBaseAdminTree;
