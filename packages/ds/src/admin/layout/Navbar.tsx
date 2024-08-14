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
            className={`flex gap-1.5 text-sm leading-5 font-medium text-gray-500 cursor-pointer pb-3.5
            ${tabItem.isActive && "border-b-2 border-blue-600 !text-blue-600"}
            `}
            onClick={tabItem.onClick}
          >
            <div>
              <span
                className={`text-[10px] leading-4 ml-8 ${
                  !tabItem.isActive && "text-gray-400"
                }`}
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
