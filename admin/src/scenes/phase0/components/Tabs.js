import Tab from "./Tab";
import React from "react";
import Warning from "../../../assets/icons/Warning";

export default function Tabs({ className = "", tabs, selected, onChange }) {
  const tabItems = tabs.map((tab) => (
    <Tab isActive={tab.value === selected} onClick={() => onChange(tab.value)} key={tab.value} className="mb-[-1px] flex">
      {tab.label}
      {tab.warning && <Warning className="ml-[4px] text-[#EA580C]" />}
    </Tab>
  ));

  return <div className={`flex items-end border-b-[1px] border-b-[#E5E7EB] ${className}`}>{tabItems}</div>;
}
