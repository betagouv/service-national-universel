import React from "react";
import Navbar from "../components/Navbar";
import { useHistory } from "react-router-dom";
import queryString from "query-string";

export default function MobileCniInvalide({ step }) {
  const history = useHistory();
  const params = queryString.parse(location.search);
  const { token } = params;

  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Done</h1>
        <div>Ferme la fenertre</div>
      </div>
    </>
  );
}
