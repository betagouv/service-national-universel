import React, { useEffect, useState } from "react";
import EduconnectButton from "../../../assets/educonnectButton";
import { apiURL } from "../../../config";

export default function EduConnectButton() {
  const [redirection, setRedirection] = useState(null);

  useEffect(() => {
    if (redirection) window.location.href = redirection;
  }, [redirection]);

  return (
    <div className="flex items-center flex-wrap">
      <button className="mb-2" onClick={() => setRedirection(`${apiURL}/educonnect/test-input`)}>
        <EduconnectButton />
      </button>
    </div>
  );
}
