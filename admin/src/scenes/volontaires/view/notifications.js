import React from "react";

import Emails from "../../../components/views/Emails";
import YoungHeader from "../../phase0/components/YoungHeader";

export default function Notifications({ young, onChange }) {
  return (
    <>
      <YoungHeader young={young} tab="notifications" onChange={onChange} />
      <div className="p-[30px]">
        <Emails email={young.email} />
      </div>
    </>
  );
}
