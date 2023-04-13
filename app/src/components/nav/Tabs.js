import React, { useEffect, useRef, useState } from "react";

// tabs should be an array of object using the following schema:
// {
//    title: String | ReactNode,
//    className?: String,
//    key: String | Number
//    ...rest
// }

const Tabs = ({ tabs = [], selectedTabKey = "", className = "", onChange = () => {} }) => {
  const [activeTabKey, setActiveTabKey] = useState(selectedTabKey || tabs[0]?.key || null);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

  const tabsRef = useRef([]);

  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[activeTabKey];
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
    }

    setTabPosition();
    window.addEventListener("resize", setTabPosition);

    return () => window.removeEventListener("resize", setTabPosition);
  }, [activeTabKey]);

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
            className={`pb-[1rem] px-[20px] appearance-none focus-visible:outline-none ${tabClassName}`}
            ref={(element) => (tabsRef.current[key] = element)}
            {...rest}>
            {title}
          </button>
        );
      })}
      <span className="absolute bottom-0 block h-[2px] bg-blue-600 transition-all duration-300" style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }} />
    </nav>
  );
};

export default Tabs;
