import React from "react";
import ChevronDown from "../assets/icons/ChevronDown";

export default function SelectAction({
  optionsGroup,
  title,
  Icon,
  disabled = false,
  alignItems = "left",
  buttonClassNames = "border-[1px] border-gray-300",
  textClassNames = "text-gray-700 font-medium text-sm",
  rightIconClassNames = "text-gray-400",
}) {
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
      <div className="py-2 relative">
        {/* select item */}
        <button
          disabled={loading || disabled}
          className={`flex justify-between items-center gap-3 px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50 ${
            loading ? "disabled:cursor-wait" : "disabled:cursor-auto"
          } ${buttonClassNames}`}
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            {Icon ? Icon : null}

            {loading ? <span className={`${textClassNames} font-medium text-sm`}>{loadingLabel}</span> : <span className={`${textClassNames}`}>{title}</span>}
          </div>
          <ChevronDown className={`${rightIconClassNames}`} />
        </button>

        {/* display options */}
        <div
          className={`${open ? "block" : "hidden"} min-w-[250px] rounded-lg bg-white transition absolute top-[55px] ${
            alignItems === "right" ? "right-0" : "left-0"
          } border-3 border-red-600 shadow overflow-hidden z-50`}>
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
