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
      <div className="relative py-2">
        {/* select item */}
        <button
          disabled={loading || disabled}
          className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 disabled:opacity-50 ${
            loading ? "disabled:cursor-wait" : "disabled:cursor-auto"
          } ${buttonClassNames}`}
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            {Icon ? Icon : null}

            {loading ? <span className={`${textClassNames} text-sm font-medium`}>{loadingLabel}</span> : <span className={`${textClassNames}`}>{title}</span>}
          </div>
          <ChevronDown className={`${rightIconClassNames}`} />
        </button>

        {/* display options */}
        <div
          className={`${open ? "block" : "hidden"} absolute top-[55px] min-w-[250px] rounded-lg bg-white transition ${
            alignItems === "right" ? "right-0" : "left-0"
          } border-3 z-50 overflow-hidden border-red-600 shadow`}>
          {optionsGroup.map((group, i) =>
            group !== null ? (
              <div key={group.key || i} className="border-b-[1px] border-gray-100 py-1 text-xs text-coolGray-600">
                {group.title ? <p className="px-3 py-2 text-xs font-medium text-gray-500">{group.title}</p> : null}
                {group.items.map((item) => (
                  <div key={item.key} onClick={() => onClickItem(item)}>
                    {item.render}
                  </div>
                ))}
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
