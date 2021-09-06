import React, { useState } from "react";
import downloadPDF from "../../utils/download-pdf";
import LoadingButton from "./LoadingButton";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const viewFile = async (a) => {
    setLoading(true);
    await downloadPDF({
      url: `/young/${young._id}/documents/convocation/${a}`,
      fileName: `${young.firstName} ${young.lastName} - convocation - ${a}.pdf`,
      errorTitle: "Une erreur est survenue lors de l'édition de votre convocation",
    });
    setLoading(false);
  };
  return (
    <LoadingButton loading={loading} onClick={() => viewFile(uri)} {...rest}>
      {children}
    </LoadingButton>
  );
};
