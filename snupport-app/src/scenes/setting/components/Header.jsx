import React from "react";

const Header = ({ title, subTitle, action }) => {
  return (
    <div className="mb-[38px] flex items-center justify-between pl-[22px]">
      <div>
        <span className="text-sm font-medium uppercase text-gray-500">{title}</span>
        <h4 className="mt-1.5 text-3xl font-bold text-black-dark">{subTitle}</h4>
      </div>

      <button type="button" className="h-[38px] rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500" onClick={action.onClick}>
        {action.name}
      </button>
    </div>
  );
};

export default Header;
