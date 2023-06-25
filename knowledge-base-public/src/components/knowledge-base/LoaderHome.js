import React from "react";
import LoaderSection from "../LoaderSection";

const LoaderHome = () => {
  return (
    <div className="mx-auto mt-[-75px] w-full px-4 md:mt-[-80px] md:w-auto">
      <div className="col-span-full grid-cols-2 gap-2.5 md:grid lg:max-w-screen-95 lg:grid-cols-3 lg:overflow-hidden lg:px-6 2xl:grid-cols-4">
        <h2 className="col-span-2 mb-4 text-xl font-bold text-white md:mx-2 lg:col-span-3 2xl:col-span-4">Thématiques générales</h2>
        <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
        <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
        <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
        <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
      </div>
    </div>
  );
};

export default LoaderHome;
