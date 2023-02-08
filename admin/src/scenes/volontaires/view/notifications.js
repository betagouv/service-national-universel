import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { ROLES } from "snu-lib";

import Emails from "../../../components/views/Emails";
import { capture } from "../../../sentry";
import API from "../../../services/api";
import YoungHeader from "../../phase0/components/YoungHeader";

export default function Notifications({ young, onChange }) {
  const [emails, setEmails] = React.useState();
  console.log("🚀 ~ file: notifications.js:13 ~ Notifications ~ emails", emails);
  const { user } = useSelector((state) => state.Auth);

  async function getEmails(address) {
    const { ok, data, code } = await API.get(`/email?email=${encodeURIComponent(address)}`);
    if (!ok) {
      capture(code);
      return toastr.error("Oups, une erreur est survenue", code);
    }
    return data;
  }

  React.useEffect(() => {
    if (young?.email && user.role === ROLES.ADMIN) {
      getEmails(young.email).then((emails) => setEmails(emails));
    }
  }, [young]);

  return (
    <>
      <YoungHeader young={young} tab="notifications" onChange={onChange} />
      <div className="m-8">{emails?.length && <Emails data={emails} />}</div>
    </>
  );
}
