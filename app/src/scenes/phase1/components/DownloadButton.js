import React from "react";

export default function DownloadButton({ text, icon, tw = "bg-indigo-700 text-white", ...rest }) {
  return (
    <button className={`flex items-center border-[1px] border-indigo-700 rounded-lg px-4 py-2.5 font-sm leading-5  mt-4 shadow-sm ${tw}`} {...rest}>
      {icon && (
        <svg className="mr-2.5" width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0.833984 11.3334L0.833984 12.1667C0.833984 13.5475 1.95327 14.6667 3.33398 14.6667L11.6673 14.6667C13.048 14.6667 14.1673 13.5475 14.1673 12.1667L14.1673 11.3334M10.834 8.00008L7.50065 11.3334M7.50065 11.3334L4.16732 8.00008M7.50065 11.3334L7.50065 1.33341"
            stroke="#C7D2FE"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{text}</span>
    </button>
  );
}
