import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi";
import Button from "./Button";

type OptionGroupItem = {
  key: string;
  render: React.ReactNode;
  loadingLabel?: string;
  action?: () => Promise<void>;
};

type OwnProps = {
  title: string;
  optionsGroup: Array<{
    key: string;
    title: string | React.ReactNode;
    items: Array<OptionGroupItem>;
  }>;
  type?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  icon?: React.ReactNode;
  buttonClassNames?: string;
};

export default function Select({
  title,
  optionsGroup,
  type = "primary",
  disabled,
  icon,
  buttonClassNames = "",
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
      <div className="relative py-2">
        {/* select item */}
        <Button
          title={loading ? loadingLabel : title}
          type={type}
          className={buttonClassNames}
          leftIcon={icon}
          rightIcon={<HiChevronDown />}
          disabled={disabled || loading}
          onClick={() => setOpen((e) => !e)}
        />

        {/* display options */}
        <div
          className={`${
            open ? "block" : "hidden"
          } absolute top-[55px] min-w-[250px] rounded-lg bg-white transition left-0 border-3 z-50 overflow-hidden border-red-600 shadow`}
        >
          {optionsGroup.map((group, i) => (
            <div
              key={group.key || i}
              className="border-b-[1px] border-gray-100 py-1 text-xs text-coolGray-600"
            >
              {group.title ? (
                <p className="px-3 py-2 text-xs font-medium text-gray-500">
                  {group.title}
                </p>
              ) : null}
              {group.items.map((item) => (
                <div key={item.key} onClick={() => onClickItem(item)}>
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
