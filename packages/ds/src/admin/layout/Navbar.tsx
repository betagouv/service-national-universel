import React from "react";

type OwnProps = {
  tab: Array<{
    title: React.ReactNode;
    label?: string;
    isActive?: boolean;
    leftIcon?: React.ReactNode;
    onClick?: () => void;
  }>;
  button?: Array<React.ReactNode> | null;
};

export default function Navbar({ tab, button }: OwnProps) {
  return (
    <div className="flex justify-between border-b border-gray-200 mb-8">
      <div className="flex gap-2 mt-3">
        {tab.map((tabItem, index) => (
          <div
            key={`tab-${index}`}
            className={`flex items-end gap-x-1.5 text-sm leading-5 font-medium text-gray-500 cursor-pointer pb-3.5
            ${
              tabItem.isActive
                ? "border-spacing-y-2 border-b-2 border-blue-600 !text-blue-600"
                : "border-b-2 border-transparent"
            }
            `}
            onClick={tabItem.onClick}
          >
            <div className="mb-1">{tabItem.leftIcon}</div>
            <div className="flex flex-col">
              {tabItem.label ? (
                <span
                  className={`text-[10px] leading-4 ${
                    !tabItem.isActive && "text-gray-400"
                  }`}
                >
                  {tabItem.label}
                </span>
              ) : null}
              <div className={`truncate mr-3 ${!tabItem.label && "mb-1"}`}>
                {tabItem.title}
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
