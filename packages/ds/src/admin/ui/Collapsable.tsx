import React, { useEffect } from "react";
import { useToggle } from "react-use";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import cx from "classnames";

interface CollapsableProps {
  title?: string;
  open?: boolean;
  className?: string;
  titleClassName?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  header?: React.ReactNode;
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
  header,
}: CollapsableProps) {
  const [isOpen, toggleOpen] = useToggle(open);

  useEffect(() => {
    toggleOpen(open);
  }, [open]);

  return (
    <div className={cx("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4">
        {header ? (
          <CustomHeader
            header={header}
            toggleOpen={toggleOpen}
            isOpen={isOpen}
          />
        ) : (
          <NoHeader
            title={title}
            titleClassName={titleClassName}
            badge={badge}
            action={action}
            toggleOpen={toggleOpen}
            isOpen={isOpen}
          />
        )}
      </div>
      {isOpen && children}
    </div>
  );
}

const NoHeader = ({
  title,
  titleClassName,
  badge,
  action,
  toggleOpen,
  isOpen,
}: {
  title?: string;
  titleClassName?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  toggleOpen: () => void;
  isOpen: boolean;
}) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-4">
      <h2 className={cx("text-lg leading-7 font-bold m-0", titleClassName)}>
        {title}
      </h2>
      {badge}
    </div>
    <div className="flex items-center gap-4">
      {action}
      <ToggleButton isOpen={isOpen} onClick={toggleOpen} />
    </div>
  </div>
);

const CustomHeader = ({
  header,
  toggleOpen,
  isOpen,
}: {
  header: React.ReactNode;
  toggleOpen: () => void;
  isOpen: boolean;
}) => (
  <div className="relative w-full">
    <div className="w-full">{header}</div>
    <div className="absolute right-0 top-1/2 -translate-y-1/2">
      <ToggleButton isOpen={isOpen} onClick={toggleOpen} />
    </div>
  </div>
);

const ToggleButton = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const Icon = isOpen ? HiOutlineChevronUp : HiOutlineChevronDown;
  return (
    <Icon
      className="cursor-pointer text-gray-500"
      size={32}
      onClick={onClick}
    />
  );
};
