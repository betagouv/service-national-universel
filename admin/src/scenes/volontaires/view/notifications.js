import React from "react";

import Emails from "../../../components/views/Emails";
import YoungHeader from "../../phase0/components/YoungHeader";
import Emails2 from "../../../components/views/Emails2";
import { environment } from "../../../config";

export default function Notifications({ young, onChange }) {
  return (
    <>
      <YoungHeader young={young} tab="notifications" onChange={onChange} />
      <div className="p-[30px]">{environment === "production" ? <Emails email={young.email} /> : <Emails2 email={young.email} />}</div>
    </>
  );
}
