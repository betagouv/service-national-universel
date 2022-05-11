import * as React from "react";
import Trash from "../../../assets/icons/Trash";

const DeleteBtnComponent = () => (
  <div className="flex justify-center items-center h-8 w-8 bg-gray-100 cursor-pointer text-gray-600 rounded-full hover:scale-105">
    <Trash width={16} height={16} />
  </div>
);

export default DeleteBtnComponent;
