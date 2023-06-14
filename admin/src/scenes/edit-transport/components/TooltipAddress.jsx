import React from "react";

const TooltipAddress = ({ children, meetingPt, handleChange }) => {
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute !top-8 left-0 mb-3 hidden flex-col items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-3 px-3 text-xs text-[#414458] shadow-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">
              {"Ville: "}
              <span className="text-xs text-gray-400">
                <input type="text" name="city" value={meetingPt.city} onChange={(e) => handleChange({ path: "city", value: e.target.value })} />
              </span>
            </div>
            <div className="text-sm font-medium">
              {"Departement: "}
              <span className="text-xs text-gray-400">
                <input type="text" name="department" value={meetingPt.department} onChange={(e) => handleChange({ path: "department", value: e.target.value })} />
              </span>
            </div>
            <div className="text-sm font-medium">
              {"Region: "}
              <span className="text-xs text-gray-400">
                <input type="text" name="region" value={meetingPt.region} onChange={(e) => handleChange({ path: "region", value: e.target.value })} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TooltipAddress;
