import React from "react";

import { regionList } from "../../components/commons";

const SelectHostRegion = ({ region, placesCenterByRegion, setOpen, onCreate, assignRegion, onDelete }) => {
  const ref = React.useRef(null);

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

  const onChange = (fromRegion, toRegion) => {
    if (assignRegion.filter((e) => e.toRegion === toRegion)?.length !== 0) onDelete(fromRegion, toRegion);
    else onCreate(fromRegion, toRegion);
  };

  return (
    <div ref={ref} className="absolute top-[110%] left-[0px] z-50 flex h-60 w-[90%] flex-col overflow-y-auto rounded-lg bg-white py-2 shadow-ninaButton">
      {regionList.map((r, i) => {
        return (
          <div key={r + i} className="flex cursor-pointer flex-row items-center justify-between px-3 py-2 hover:bg-gray-100" onClick={() => onChange(region, r)}>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <input type={"checkbox"} checked={assignRegion.find((e) => e.toRegion === r) || false} readOnly />
              {r}
            </div>
            <div className="text-sm uppercase text-gray-500">{placesCenterByRegion[r] ? placesCenterByRegion[r] : 0} places</div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectHostRegion;
