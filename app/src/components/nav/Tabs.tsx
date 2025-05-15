import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// tabs should be an array of object using the following schema:
// {
//    title: String | ReactNode,
//    className?: String,
//    key: String | Number
//    ...rest
// }

const Tabs = ({ tabs, selectedTabKey = "", className = "" }) => {
  const activeTabKey = selectedTabKey || tabs[0]?.key || null;
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineOffsetLeft, setTabUnderlineOffsetLeft] = useState(0);

  const tabsRef = useRef({});

  const setTabPosition = () => {
    const currentTab = tabsRef.current[activeTabKey];
    setTabUnderlineOffsetLeft(currentTab?.offsetLeft ?? 0);
    setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
  };

  useEffect(() => {
    setTabPosition();
    window.addEventListener("resize", setTabPosition);
    return () => {
      window.removeEventListener("resize", setTabPosition);
    };
  }, [activeTabKey]);

  return (
    <nav className={`scrollbar-hide relative flex flex-nowrap overflow-x-auto border-b-[1px] border-gray-200 ${className}`}>
      {tabs.map(({ className: tabClassName = "", title, key, ...rest }) => {
        return (
          <Link
            key={key}
            to={key}
            ref={(el) => (tabsRef.current[key] = el)}
            style={{
              paddingBottom: "1rem",
              paddingRight: 20,
              paddingLeft: 20,
            }}
            className={`appearance-none whitespace-nowrap text-sm text-gray-500 transition-all duration-300 focus-visible:outline-none ${
              key === activeTabKey ? "text-blue-600" : ""
            } ${tabClassName}`}
            {...rest}>
            {title}
          </Link>
        );
      })}
      <span className="absolute bottom-0 block h-[2px] bg-blue-600 transition-all duration-300" style={{ left: tabUnderlineOffsetLeft, width: tabUnderlineWidth }} />
    </nav>
  );
};

export default Tabs;
