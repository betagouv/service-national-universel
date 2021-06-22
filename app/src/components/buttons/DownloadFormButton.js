import React, { useState } from "react";
import { Spinner } from "reactstrap";
import { toastr } from "react-redux-toastr";
import * as Sentry from "@sentry/browser";
import { download } from "snu-lib";
import api from "../../services/api";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const viewFile = async (a) => {
    setLoading(true);
    await downloadPDF({
      url: `/young/${young._id}/form/${a}`,
      body: { young },
      fileName: `${young.firstName} ${young.lastName} - formulaire - ${a}.pdf`,
    });
    setLoading(false);
  };
  return (
    <div {...rest} onClick={() => viewFile(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </div>
  );
};
