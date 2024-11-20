import React, { useEffect } from "react";
import { useToggle } from "react-use";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";

interface CollapsableProps {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}

export default function Collapsable({
  title,
  open = true,
  children,
}: CollapsableProps) {
  const [isOpen, toggleOpen] = useToggle(open);

  useEffect(() => {
    toggleOpen(open);
  }, [open]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg leading-7 font-bold m-0">{title}</h2>
        {isOpen ? (
          <HiOutlineChevronUp
            className="cursor-pointer text-gray-500"
            size={32}
            onClick={toggleOpen}
          />
        ) : (
          <HiOutlineChevronDown
            className="cursor-pointer text-gray-500"
            size={32}
            onClick={toggleOpen}
          />
        )}
      </div>
      {isOpen && children}
    </div>
  );
}
