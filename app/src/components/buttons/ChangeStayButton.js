import React from "react";
import { Link } from "react-router-dom";

// This button could be a generic button
// It could be named `SecondaryOutlinedButton` for example
const ChangeStayButton = () => {
  return (
    <Link
      to="/changer-de-sejour"
      className="my-2 md:my-0 h-fit border-[1px] border-gray-300 text-gray-700 outline-none rounded-md font-medium text-sm block w-auto py-[10px] px-10 hover:text-gray-700">
      Changer de séjour
    </Link>
  );
};

export default ChangeStayButton;
