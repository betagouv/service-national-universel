import React, { useEffect, useState } from "react";
import IconFrance from "../../assets/IconFrance";
import { apiURL } from "../../config";

export default function EduConnectButton() {
  const [redirection, setRedirection] = useState(null);

  useEffect(() => {
    if (redirection) window.location.href = redirection;
  }, [redirection]);

  return (
    <button
      className="flex justify-center items-center transition-all w-[315px] h-12 gap-2 px-4 py-2 rounded-xl border-2 border-blue-600 shadow-md hover:border-4"
      onClick={() => setRedirection(`${apiURL}/young/educonnect/login`)}>
      <IconFrance />
      <span className=" text-sm text-left text-gray-800 ">
        S’identifier avec <b>Éduconnect</b>
      </span>
    </button>
  );
}
