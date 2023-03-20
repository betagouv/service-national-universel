import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Spinner } from "reactstrap";
import { setYoung } from "../../redux/auth/actions";
import API from "../../services/api";
import plausibleEvent from "../../services/plausible";
import downloadPDF from "../../utils/download-pdf";

export default function DownloadConvocationButton({ young, children, uri, ...rest }) {
  const [loading, setLoading] = useState();

  const dispatch = useDispatch();

  const handleDownload = async () => {
    if (young?.convocationFileDownload === "true") return;
    const { data } = await API.put(`/young/phase1/convocation`, { convocationFileDownload: "true" });
    plausibleEvent("affecté_step3");
    dispatch(setYoung(data));
  };

  const viewFile = async (a) => {
    setLoading(true);
    plausibleEvent("Phase1/telechargement convocation");
    await downloadPDF({
      url: `/young/${young._id}/documents/convocation/${a}`,
      fileName: `${young.firstName} ${young.lastName} - convocation - ${a}.pdf`,
      errorTitle: "Une erreur est survenue lors de l'édition de votre convocation",
    });
    handleDownload();
    setLoading(false);
  };
  return (
    <div {...rest} onClick={() => viewFile(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </div>
  );
}
