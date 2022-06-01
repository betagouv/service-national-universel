import React from "react";
import { Link } from "react-router-dom";

export default function emptyCard() {
  return (
    <Link
      to="/candidature"
      className="group flex flex-col w-56 justify-start items-center border shadow-md rounded-lg bg-white p-3 hover:-translate-y-1 transition duration-100 ease-in">
      <div className="flex flex-1 flex-col justify-center items-center">
        <Link to="/candidature">
          <div className="text-gray-700 bg-gray-100 rounded-lg p-2 px-3 text-center text-xs">Gérer mes candidatures</div>
        </Link>
      </div>
    </Link>
  );
}
