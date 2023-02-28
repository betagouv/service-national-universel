import React from "react";
import { Link } from "react-router-dom";

const ChangeStayButton = () => {
  return (
    <Link
      to="/changer-de-sejour"
      className="my-4 md:my-0 h-fit border-[1px] border-gray-300 text-gray-700 outline-none rounded-md font-semibold text-sm block w-auto py-[10px] px-10 hover:text-gray-700">
      Changer de séjour
    </Link>
  );
};

export default ChangeStayButton;
