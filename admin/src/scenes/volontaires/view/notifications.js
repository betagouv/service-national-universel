import React from "react";

import Wrapper from "./wrapper";
import Emails from "../../../components/views/Emails";

export default function Notifications({ young, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <Wrapper young={young} tab="notifications" onChange={onChange}>
        <Emails email={young.email} />
      </Wrapper>
    </div>
  );
}
