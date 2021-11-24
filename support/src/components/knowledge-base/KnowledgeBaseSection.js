import React, { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import Sortable from "sortablejs";
import { toast } from "react-toastify";
import { SUPPORT_ROLES } from "snu-lib/roles";
import withAuth from "../../hocs/withAuth";
import API from "../../services/api";
import { filterTags } from "../../utils/tags";
import KnowledgeBaseCard from "./KnowledgeBaseCard";
import KnowledgeBaseCreate from "./KnowledgeBaseCreate";
import KnowledgeBaseEdit from "./KnowledgeBaseEdit";

const KnowledgeBaseSection = ({ section, isRoot }) => {
  const { mutate } = useSWRConfig();
  const gridRef = useRef(null);
  const sortable = useRef(null);

  const onListChange = async () => {
    const newSort = [...gridRef.current.children]
      .map((i) => i.dataset.position)
      .map((oldPosition) => section.children.find((item) => item.position.toString() === oldPosition))
      .map((sortedItem, index) => ({ ...sortedItem, position: index + 1 }));

    const response = await API.put({ path: "/support-center/knowledge-base/reorder", body: newSort.map(({ _id, position }) => ({ _id, position, parentId: section._id })) });
    if (!response.ok) return toast.error("Désolé, une erreur est survenue. Veuillez recommencer !");
    if (section.slug) mutate(API.getUrl({ path: `/support-center/knowledge-base/${section.slug}`, query: { withTree: true, withParents: true } }));
    mutate(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));
  };

  useEffect(() => {
    sortable.current = Sortable.create(gridRef.current, { animation: 150, onEnd: onListChange });
  }, []);

  return (
    <>
      <div className="flex flex-col flex-grow flex-shrink overflow-hidden w-full">
        <div className="px-8 py-3 flex justify-between">
          {!isRoot && (
            <>
              <div>
                <h2 className="font-bold text-lg">{section.title}</h2>
                {!!section.description?.length && <p className="mt-1 text-sm italic">{section.description}</p>}
                {!!section.allowedRoles?.length && (
                  <p className="flex flex-wrap mt-3.5  text-sm">
                    Visible par:
                    {section.allowedRoles.filter(filterTags).map((tag) => (
                      <span className="bg-gray-200 px-2 py-0.5 rounded-xl ml-2 mb-2 text-xs" key={tag}>
                        {SUPPORT_ROLES[tag]}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <KnowledgeBaseEdit key={section.slug} sectionOrAnswer={section} />
            </>
          )}
        </div>
        <div ref={gridRef} className="flex flex-wrap h-full w-full py-12 flex-shrink overflow-y-auto">
          {section.children.length ? (
            section.children.map((item) => (
              <KnowledgeBaseCard key={item._id} position={item.position} title={item.title} date={item.createdAt} author={item.author} tags={item.allowedRoles} slug={item.slug} />
            ))
          ) : (
            <span className="self-center w-full text-center text-gray-400 my-auto block">Pas de contenu, pour l'instant !</span>
          )}
        </div>
      </div>
      <KnowledgeBaseCreate position={section.children.length + 1} parentId={section._id} />
    </>
  );
};

export default withAuth(KnowledgeBaseSection);
