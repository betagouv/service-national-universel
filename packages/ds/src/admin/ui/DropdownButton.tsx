import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi";
import Button from "./Button";
import Badge from "./Badge";
import { classNames } from "../../utils";

type OptionGroupItem = {
  key: string;
  render: React.ReactNode;
  loadingLabel?: string;
  optionClassNames?: string;
  action?: () => Promise<void>;
};

type TStatus =
  | "none"
  | "DRAFT"
  | "CANCEL"
  | "REFUSED"
  | "IN_PROGRESS"
  | "WAITING_VALIDATION"
  | "WAITING_CORRECTION"
  | "VALIDATED"
  | "WAITING_LIST"
  | "secondary"
  | "primary";

type OwnProps = {
  title: React.ReactNode;
  optionsGroup: Array<{
    key: string;
    title: string | React.ReactNode;
    items: Array<OptionGroupItem>;
  }>;
  mode?: "default" | "badge";
  rightIcon?: boolean;
  status?: TStatus;
  type?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  icon?: React.ReactNode;
  buttonClassName?: string;
  position?: "left" | "right";
  tooltip?: string;
};

export default function DropdownButton({
  title,
  optionsGroup,
  mode = "default",
  rightIcon = true,
  status = "none",
  type = "primary",
  disabled = false,
  icon,
  buttonClassName = "",
  position = "left",
  tooltip,
}: OwnProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Chargement...");
  const ref = useRef<HTMLDivElement | null>(null);

  const onClickItem = async (item: OptionGroupItem) => {
    setLoading(true);
    setOpen(false);
    item.loadingLabel && setLoadingLabel(item.loadingLabel);
    await item.action?.();
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div ref={ref}>
      <div className="relative print:hidden">
        {/* select item */}
        {mode === "badge" ? (
          <Badge
            title={loading ? loadingLabel : title}
            status={status}
            mode={"editable"}
            leftIcon={icon}
            rightIcon={
              rightIcon && <HiChevronDown size={16} className="mt-0.5" />
            }
            className={buttonClassName}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen((open) => !open);
            }}
          />
        ) : (
          <Button
            title={loading ? loadingLabel : title}
            type={type}
            className={`${buttonClassName} ${loading && "cursor-wait"} ${
              open && "!text-blue-600"
            }`}
            leftIcon={icon}
            rightIcon={
              rightIcon && (
                <HiChevronDown size={20} className={`mt-0.5 -mr-[7px]`} />
              )
            }
            disabled={disabled || loading}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen((open) => !open);
            }}
            tooltip={tooltip}
          />
        )}

        {/* display options */}
        <div className={getDivClass({ open, position })}>
          {optionsGroup.map((group, i) => (
            <div
              key={group.key || i}
              className={`${
                i !== optionsGroup.length - 1 ? "border-b border-gray-100 " : ""
              }py-1 text-xs`}
            >
              {group.title ? (
                <p className="px-3 py-2 text-xs font-medium text-gray-500">
                  {group.title}
                </p>
              ) : null}
              {group.items.map((item) => (
                <div
                  className={`flex cursor-pointer rounded-sm m-0.5 items-center gap-2 p-2 px-3 text-gray-900 text-sm hover:bg-gray-100 ${item.optionClassNames}`}
                  key={item.key}
                  onClick={() => onClickItem(item)}
                >
                  {item.render}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const getDivClass = ({
  open,
  position,
}: {
  open?: boolean;
  position: "left" | "right";
}) => {
  const baseClass = `absolute top-[45px] min-w-[250px] rounded-lg bg-white transition ${
    position === "left" ? "left-0" : "right-0"
  } border-3 z-50 overflow-hidden shadow-md border border-gray-100`;
  if (open) {
    return classNames(baseClass, "block");
  } else {
    return classNames(baseClass, "hidden");
  }
};
