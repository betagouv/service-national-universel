import React, { useEffect } from "react";
import { useToggle } from "react-use";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import cx from "classnames";

interface CollapsableProps {
  title: string;
  open?: boolean;
  className?: string;
  titleClassName?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode | React.ReactNode[];
}

export default function Collapsable({
  open = true,
  title,
  titleClassName,
  badge,
  action,
  className,
  children,
}: CollapsableProps) {
  const [isOpen, toggleOpen] = useToggle(open);

  useEffect(() => {
    toggleOpen(open);
  }, [open]);

  return (
    <div className={cx("flex flex-col gap-6", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className={cx("text-lg leading-7 font-bold m-0", titleClassName)}>
            {title}
          </h2>
          {badge}
        </div>
        <div className="flex items-center gap-4">
          {action}
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
      </div>
      {isOpen && children}
    </div>
  );
}
