import React from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import CursorClick from "../../../assets/icons/CursorClick";

export default function SelectAction({ optionsGroup, title }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onClickItem = async (item) => {
    setLoading(true);
    setOpen(false);
    await item.action?.();
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Marianne" }}>
      <div className="py-2 pl-3 relative">
        {/* select item */}
        <div className="flex justify-between items-center gap-3 border-[1px] border-gray-300 px-3 py-2 rounded-lg cursor-pointer" onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            <CursorClick className="text-gray-400" />
            <span className="text-gray-700 font-medium text-sm">{title}</span>
          </div>
          <ChevronDown className="text-gray-400" />
        </div>

        {/* display options */}
        <div
          className={`${open ? "block" : "hidden"} min-w-[250px] rounded-lg bg-white transition absolute top-[55px] right-0 border-3 border-red-600 shadow overflow-hidden z-50`}>
          {optionsGroup.map((group, i) => (
            <div key={group.key || i} className="text-xs text-coolGray-600 border-b-[1px] border-gray-100 py-1">
              {group.title ? <p className="font-medium text-xs text-gray-500 px-3 py-2">{group.title}</p> : null}
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
