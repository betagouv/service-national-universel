import React from "react";

const LoaderSection = ({ className = "" }) => (
  <div className={`md:w-72 ${className}`}>
    <div className="relative flex flex-grow flex-col overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="flex h-[60px] w-full items-center justify-center overflow-hidden pl-4 pr-9 md:h-[80px]">
        <div className="mr-4 h-8 w-8 rounded-md bg-gray-200" />
        <div className="h-6 flex-1 rounded bg-gray-200">
          <div className="animated-background" />
        </div>
      </div>
      <ul className="hidden flex-col items-start justify-start md:flex">
        <li className="flex h-[56px] w-full px-4">
          <div className="flex w-full border-t border-t-gray-200 py-4">
            <span className="w-full rounded bg-gray-200" />
          </div>
        </li>
        <li className="flex h-[56px] w-full px-4">
          <div className="flex w-full border-t border-t-gray-200 py-4">
            <span className="w-full rounded bg-gray-200" />
          </div>
        </li>
        <li className="flex h-[56px] w-full px-4">
          <div className="flex w-full border-t border-t-gray-200 py-4">
            <span className="w-full rounded bg-gray-200" />
          </div>
        </li>
        <li className="flex h-[52px] w-full border-t border-t-gray-200 bg-gray-50 p-4">
          <span className="w-full rounded bg-gray-200" />
        </li>
      </ul>
    </div>
  </div>
);

export default LoaderSection;
