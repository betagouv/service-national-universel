import React from "react";

const Toggle = ({ toggled, onClick }) => {
  return toggled ? (
    <div onClick={onClick} name="visibility" className={`flex h-6 w-10 cursor-pointer items-center rounded-full bg-blue-600 transition duration-100 ease-in`}>
      <div className="flex h-6 w-6 translate-x-[16px] items-center justify-center rounded-full border-[1px] border-blue-600 bg-white shadow-nina transition duration-100 ease-in"></div>
    </div>
  ) : (
    <div
      onClick={onClick}
      name="visibility"
      className={`flex h-6 w-10 cursor-pointer items-center rounded-full border-[1px] border-blue-600 bg-white transition duration-100 ease-in`}>
      <div className="flex h-6 w-6 translate-x-[-1px] items-center justify-center rounded-full border-[1px] border-blue-600 bg-white shadow-nina transition duration-100 ease-in"></div>
    </div>
  );
};

export default Toggle;
