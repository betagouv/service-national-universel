import React, { useState } from "react";
import { Spinner } from "reactstrap";
import { toastr } from "react-redux-toastr";

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
      toastr.error("Une erreur est survenu lors de l'édition de votre convocation", e, { timeOut: 10000 });
      setLoading(false);
    }
  };
  return (
    <div {...rest} onClick={() => viewFile(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </div>
  );
};
