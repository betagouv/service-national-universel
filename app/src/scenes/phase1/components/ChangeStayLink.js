import React from "react";
import { Link } from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";

const ChangeStayLink = ({ className }) => {
  return (
    <Link to="/changer-de-sejour" className={`d-flex gap-2 items-center text-blue-600 text-xs ${className}`}>
      Changer de séjour <ChevronRight className="mt-1" />
    </Link>
  );
};

export default ChangeStayLink;
