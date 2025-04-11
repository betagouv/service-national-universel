import React, { useRef, useState } from "react";
import { BsTrash } from "react-icons/bs";
import { useTreeFilter } from "./TreeFilterContext";
import { TreeNodeFilter } from "./TreeNodeFilter";
import { useClickOutside } from "./hooks/useClickOutside";

export function InnerLevelTreeFilter({ nodeId }: { nodeId: string }) {
  const { id, getNode, deleteNode } = useTreeFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  const item = getNode(nodeId);
  if (!item) return null;

  if (!item.childIds?.length) {
    return (
      <div className="flex items-center gap-2 p-2 overflow-y-auto hover:bg-gray-100 cursor-pointer">
        <TreeNodeFilter nodeId={nodeId} key={`tnf-no-childIds-${id}-${nodeId}`} />
      </div>
    );
  }

  const isLeaf = item.childIds?.every((childId) => {
    const child = getNode(childId);
    return child?.isLeaf;
  });

  const filteredIds = item.childIds?.filter((childId) => {
    const child = getNode(childId);
    return child?.label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative" ref={ref}>
      <div className={`flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-gray-100`} onClick={() => setIsOpen(!isOpen)}>
        <TreeNodeFilter nodeId={nodeId} key={`tnf-${id}-${nodeId}`} />
      </div>
      {isOpen && (
        <div className={`absolute left-full top-0 z-10 ml-2 w-64 max-h-[1500px] ${isLeaf ? "overflow-y-auto" : ""} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5`}>
          <div className="flex content-center gap-2 justify-between px-3 py-2 pt-3 ">
            <div className="text-xs font-light leading-5 text-gray-700 ">{item?.label}</div>
            <BsTrash
              className="h-4 w-4 text-red-500 hover:text-red-700 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(nodeId);
              }}
            />
          </div>
          <div className="flex items-center gap-2 pt-2 px-3">
            <input
              type="text"
              placeholder={`Recherche ${item?.label}`}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs w-full"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col py-2 v-gap-2">{filteredIds?.map((childId) => <InnerLevelTreeFilter key={`itl-${id}-nl-${childId}`} nodeId={childId} />)}</div>
        </div>
      )}
    </div>
  );
}
