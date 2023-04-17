import React, { useState } from "react";

// tabs should be an array of object using the following schema:
// {
//    title: String | ReactNode,
//    className?: String,
//    key: String | Number
//    ...rest
// }

const Tabs = ({ tabs = [], selectedTabKey = "", className = "", onChange = () => {} }) => {
  const [activeTabKey, setActiveTabKey] = useState(selectedTabKey || tabs[0]?.key || null);

  const handleChangeTab = (key) => () => {
    setActiveTabKey(key);
    onChange(key);
  };

  return (
    <nav className={`border-b-[1px] border-gray-200 relative ${className}`}>
      {tabs.map(({ className: tabClassName = "", title, key, ...rest }) => {
        return (
          <button
            key={key}
            onClick={handleChangeTab(key)}
            className={`pb-[1rem] px-[20px] appearance-none focus-visible:outline-none ${activeTabKey === key ? "border-b-2 border-blue-600" : ""} ${tabClassName}`}
            {...rest}>
            {title}
          </button>
        );
      })}
    </nav>
  );
};

export default Tabs;
