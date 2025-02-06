import React from "react";
import { Link } from "react-router-dom";
import { PointDeRassemblementType } from "snu-lib";
import ExternalLink from "@/assets/icons/ExternalLink";

interface PointDeRassemblementLabelProps {
  pdr: Partial<PointDeRassemblementType>;
  showLink?: boolean;
}

const PointDeRassemblementLabel: React.FC<PointDeRassemblementLabelProps> = ({ pdr, showLink = false }) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-[15px] font-medium leading-6 text-[#242526]">
          {pdr.department} • {pdr.region}
        </p>
        {showLink && (
          <Link
            to={`/point-de-rassemblement/${pdr._id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}>
            <ExternalLink className="text-[#9CA3AF]" />
          </Link>
        )}
      </div>
      <p className="text-xs font-light leading-4 text-[#738297]">{pdr.name}</p>
      <p className="text-xs font-light leading-4 text-[#738297]">
        {pdr.address}, {pdr.zip}, {pdr.city}
      </p>
    </div>
  );
};

export default PointDeRassemblementLabel;
