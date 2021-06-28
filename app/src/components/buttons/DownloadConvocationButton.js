import React, { useState } from "react";
import { Spinner } from "reactstrap";
import { toastr } from "react-redux-toastr";
import * as Sentry from "@sentry/browser";

import api from "../../services/api";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const viewFile = async (a) => {
    try {
      setLoading(true);
      const file = await api.openpdf(`/young/${young._id}/convocation/${a}`, { young });
      const fileName = `${young.firstName} ${young.lastName} - convocation - ${a}.pdf`;
      if (window.navigator.msSaveOrOpenBlob) {
        //IE11 & Edge
        window.navigator.msSaveOrOpenBlob(file, fileName);
      } else {
        //Other browsers
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
      }
      setLoading(false);
    } catch (e) {
      if (e?.message === "unauthorized") {
        return (window.location.href = "/auth/login?disconnected=1&redirect=phase1");
      }
      Sentry.captureException(e);
      toastr.error("Une erreur est survenue lors de l'édition de votre convocation", e?.message, { timeOut: 10000 });
      setLoading(false);
    }
  };
  return (
    <div {...rest} onClick={() => viewFile(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </div>
  );
};
