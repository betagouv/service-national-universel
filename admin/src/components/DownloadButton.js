import React, { useState } from "react";
import LoadingButton from "./loadingButton";
import styled from "styled-components";
import * as FileSaver from "file-saver";
import { toastr } from "react-redux-toastr";

export default function DownloadButton({ source, title, ...rest }) {
  const [buttonsLoading, setButtonsLoading] = useState(false);
  return (
    <DownloadBtn
      {...rest}
      color="white"
      loading={buttonsLoading}
      onClick={async () => {
        const downloadAlert =
          "En téléchargeant cette pièce jointe, vous vous engagez à la supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)";
        if (confirm(downloadAlert)) {
          setButtonsLoading(true);
          try {
            const f = await source();
            FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
          } catch (e) {
            toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
          }
          setButtonsLoading(false);
        }
      }}
    >
      {title}
    </DownloadBtn>
  );
}

const DownloadBtn = styled(LoadingButton)`
  color: #555;
  background: url(${require("../assets/download.svg")}) left 15px center no-repeat;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  border: 0;
  outline: 0;
  border-radius: 5px;
  padding: 8px 25px 8px 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 5px;
  margin-top: 1rem;
`;
