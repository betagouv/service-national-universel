import React from "react";
import { Link } from "react-router-dom";
import { CenterDetailDto, CohesionCenterType } from "snu-lib";
import ExternalLink from "@/assets/icons/ExternalLink";

interface CentreLabelProps {
  centre: Partial<CenterDetailDto | CohesionCenterType>;
  showLink?: boolean;
  className?: string;
}

const CentreLabel: React.FC<CentreLabelProps> = ({ centre, showLink = false, className = "" }) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <p className="text-[15px] font-medium leading-6 text-gray-800]">
          {centre.department} • {centre.region}
        </p>
        {showLink && (
          <Link
            to={`/centre/${centre._id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}>
            <ExternalLink className="text-[#9CA3AF]" />
          </Link>
        )}
      </div>
      <div className="text-left">
        <p className="text-xs font-light leading-4 text-gray-500">{centre.name}</p>
        <p className="text-xs font-light leading-4 text-gray-500">
          {centre.address}, {centre.zip}, {centre.city}
        </p>
      </div>
    </div>
  );
};

export default CentreLabel;
