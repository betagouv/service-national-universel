import React from "react";
import cx from "classnames";

type NavbarControlledProps = {
  tabs: Array<{
    id: string;
    title: React.ReactNode | string;
    label?: string;
    leftIcon?: React.ReactNode;
  }>;
  active?: string;
  onTabChange?: (id: string) => void;
  button?: Array<React.ReactNode>;
  className?: string;
};

export default function NavbarControlled({
  tabs,
  active,
  onTabChange,
  button,
  className,
}: NavbarControlledProps) {
  return (
    <div
      className={cx(
        "flex justify-between border-b border-gray-200 mb-8 pt-3",
        className,
      )}
    >
      <div className="flex gap-2">
        {tabs.map((tabItem, index) => (
          <div
            key={`tab-${index}`}
            className={cx(
              "flex gap-1.5 text-sm leading-5 font-medium text-gray-500 cursor-pointer pb-3.5",
              {
                "border-b-2 border-blue-600 !text-blue-600":
                  tabItem.id === active,
              },
            )}
            onClick={() => onTabChange?.(tabItem.id)}
          >
            <div>
              <span
                className={cx("text-[10px] leading-4 ml-8", {
                  "text-gray-400": tabItem.id !== active,
                })}
              >
                {tabItem.label}
              </span>
              <div className="flex gap-2">
                {tabItem.leftIcon}
                <span className="truncate mr-3">{tabItem.title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {button && (
        <div className="flex gap-4 pb-3">
          {button?.map((buttonItem, index) => (
            <div key={`button-${index}`}>{buttonItem}</div>
          ))}
        </div>
      )}
    </div>
  );
}
