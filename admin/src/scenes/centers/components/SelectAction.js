import React from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import CursorClick from "../../../assets/icons/CursorClick";

export default function SelectAction({ optionsGroup, title }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingLabel, setLoadingLabel] = React.useState("Chargement...");
  const ref = React.useRef(null);

  const onClickItem = async (item) => {
    setLoading(true);
    setOpen(false);
    item.loadingLabel && setLoadingLabel(item.loadingLabel);
    await item.action?.();
    setLoading(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div style={{ fontFamily: "Marianne" }} ref={ref}>
      <div className="py-2 pl-3 relative">
        {/* select item */}
        <button
          disabled={loading}
          className="flex justify-between items-center gap-3 border-[1px] border-gray-300 px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            <CursorClick className="text-gray-400" />
            {loading ? <span className="text-gray-700 font-medium text-sm">{loadingLabel}</span> : <span className="text-gray-700 font-medium text-sm">{title}</span>}
          </div>
          <ChevronDown className="text-gray-400" />
        </button>

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
