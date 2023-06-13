import React from "react";
import { Link } from "react-router-dom";

export default function emptyCard() {
  return (
    <Link
      to="/candidature"
      className="group flex w-56 flex-col items-center justify-start rounded-lg bg-white p-3 shadow-nina transition duration-100 ease-in hover:-translate-y-1">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Link to="/candidature">
          <div className="rounded-lg bg-gray-100 p-2 px-3 text-center text-xs text-gray-700">Gérer mes candidatures</div>
        </Link>
      </div>
    </Link>
  );
}
