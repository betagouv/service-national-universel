import React from "react";
import { Link } from "react-router-dom";

// This button could be a generic button
// It could be named `SecondaryOutlinedButton` for example
const ChangeStayButton = () => {
  return (
    <Link
      to="/changer-de-sejour"
      className="my-2 block h-fit w-auto rounded-md border-[1px] border-gray-300 py-[10px] px-10 text-sm font-medium text-gray-700 outline-none hover:text-gray-700 md:my-0">
      Changer de séjour
    </Link>
  );
};

export default ChangeStayButton;
